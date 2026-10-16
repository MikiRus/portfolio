// Package docker — минимальный клиент Docker Engine API: ровно те вызовы,
// которые нужны песочнице. Работает через unix-сокет или TCP (socket-proxy).
package docker

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
)

const apiVersion = "v1.43"

type Client struct {
	http *http.Client
	base string
}

// New принимает DOCKER_HOST: unix:///var/run/docker.sock или tcp://host:2375.
func New(host string) (*Client, error) {
	switch {
	case strings.HasPrefix(host, "unix://"):
		path := strings.TrimPrefix(host, "unix://")
		tr := &http.Transport{DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
			return (&net.Dialer{}).DialContext(ctx, "unix", path)
		}}
		return &Client{http: &http.Client{Transport: tr}, base: "http://docker/" + apiVersion}, nil
	case strings.HasPrefix(host, "tcp://"):
		return &Client{http: &http.Client{}, base: "http://" + strings.TrimPrefix(host, "tcp://") + "/" + apiVersion}, nil
	}
	return nil, fmt.Errorf("unsupported DOCKER_HOST %q", host)
}

// APIError — ответ Docker с кодом ошибки.
type APIError struct {
	Status  int
	Message string
}

func (e *APIError) Error() string { return fmt.Sprintf("docker: %d %s", e.Status, e.Message) }

func IsNotFound(err error) bool {
	var ae *APIError
	return errors.As(err, &ae) && ae.Status == http.StatusNotFound
}

func (c *Client) do(ctx context.Context, method, path string, body, out any) error {
	resp, err := c.stream(ctx, method, path, body)
	if err != nil {
		return err
	}
	defer resp.Close()
	if out == nil {
		_, _ = io.Copy(io.Discard, resp)
		return nil
	}
	return json.NewDecoder(resp).Decode(out)
}

func (c *Client) stream(ctx context.Context, method, path string, body any) (io.ReadCloser, error) {
	var r io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		r = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.base+path, r)
	if err != nil {
		return nil, err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode >= 300 {
		defer resp.Body.Close()
		var e struct{ Message string }
		_ = json.NewDecoder(resp.Body).Decode(&e)
		return nil, &APIError{Status: resp.StatusCode, Message: e.Message}
	}
	return resp.Body, nil
}

type Container struct {
	Name        string
	Image       string
	Cmd         []string
	Env         []string
	Labels      map[string]string
	Network     string
	Alias       string
	Memory      int64 // байты
	NanoCPUs    int64
	PidsLimit   int64
	Tmpfs       map[string]string
	Hardened    bool // cap-drop ALL + no-new-privileges; postgres без этого не стартует
	Healthcheck *Healthcheck
}

type Healthcheck struct {
	Test     []string
	Interval int64 // наносекунды, как в API
	Timeout  int64
	Retries  int
}

func (c *Client) CreateContainer(ctx context.Context, spec Container) (string, error) {
	host := map[string]any{
		"NetworkMode": spec.Network,
		"Memory":      spec.Memory,
		"MemorySwap":  spec.Memory, // без свопа сверх лимита
		"NanoCpus":    spec.NanoCPUs,
		"PidsLimit":   spec.PidsLimit,
		"Tmpfs":       spec.Tmpfs,
		"LogConfig":   map[string]any{"Type": "json-file", "Config": map[string]string{"max-size": "1m"}},
	}
	if spec.Hardened {
		host["CapDrop"] = []string{"ALL"}
		host["SecurityOpt"] = []string{"no-new-privileges"}
	}
	body := map[string]any{
		"Image":      spec.Image,
		"Cmd":        spec.Cmd,
		"Env":        spec.Env,
		"Labels":     spec.Labels,
		"HostConfig": host,
		"NetworkingConfig": map[string]any{
			"EndpointsConfig": map[string]any{spec.Network: map[string]any{"Aliases": []string{spec.Alias}}},
		},
	}
	if spec.Healthcheck != nil {
		body["Healthcheck"] = spec.Healthcheck
	}
	var out struct {
		ID string `json:"Id"`
	}
	err := c.do(ctx, http.MethodPost, "/containers/create?name="+url.QueryEscape(spec.Name), body, &out)
	return out.ID, err
}

func (c *Client) StartContainer(ctx context.Context, id string) error {
	return c.do(ctx, http.MethodPost, "/containers/"+id+"/start", nil, nil)
}

type State struct {
	Status   string // created | running | exited | dead
	ExitCode int
	Health   string // starting | healthy | unhealthy | "" если нет healthcheck
}

func (c *Client) InspectContainer(ctx context.Context, id string) (State, error) {
	var out struct {
		State struct {
			Status   string
			ExitCode int
			Health   *struct{ Status string }
		}
	}
	if err := c.do(ctx, http.MethodGet, "/containers/"+id+"/json", nil, &out); err != nil {
		return State{}, err
	}
	s := State{Status: out.State.Status, ExitCode: out.State.ExitCode}
	if out.State.Health != nil {
		s.Health = out.State.Health.Status
	}
	return s, nil
}

func (c *Client) RemoveContainer(ctx context.Context, id string) error {
	err := c.do(ctx, http.MethodDelete, "/containers/"+id+"?force=true&v=true", nil, nil)
	if IsNotFound(err) {
		return nil
	}
	return err
}

// Logs отдаёт поток логов контейнера с follow; читать через Demux.
func (c *Client) Logs(ctx context.Context, id string) (io.ReadCloser, error) {
	return c.stream(ctx, http.MethodGet, "/containers/"+id+"/logs?follow=true&stdout=true&stderr=true", nil)
}

// CreateNetwork создаёт изолированную сеть без выхода в интернет.
func (c *Client) CreateNetwork(ctx context.Context, name string, labels map[string]string) (string, error) {
	var out struct {
		ID string `json:"Id"`
	}
	err := c.do(ctx, http.MethodPost, "/networks/create", map[string]any{
		"Name": name, "Internal": true, "Labels": labels, "CheckDuplicate": true,
	}, &out)
	return out.ID, err
}

func (c *Client) ConnectNetwork(ctx context.Context, network, container string) error {
	return c.do(ctx, http.MethodPost, "/networks/"+network+"/connect", map[string]any{"Container": container}, nil)
}

func (c *Client) RemoveNetwork(ctx context.Context, network, self string) error {
	if self != "" {
		// Ошибку не проверяем: «not connected» значит, что уже отключены,
		// а настоящую проблему покажет удаление сети ниже.
		_ = c.do(ctx, http.MethodPost, "/networks/"+network+"/disconnect", map[string]any{"Container": self, "Force": true}, nil)
	}
	err := c.do(ctx, http.MethodDelete, "/networks/"+network, nil, nil)
	if IsNotFound(err) {
		return nil
	}
	return err
}

// Labeled — id контейнеров и сетей с меткой label (для уборки после рестарта).
func (c *Client) Labeled(ctx context.Context, label string) (containers, networks []string, err error) {
	f := url.QueryEscape(`{"label":["` + label + `"]}`)
	var cs []struct {
		ID string `json:"Id"`
	}
	if err = c.do(ctx, http.MethodGet, "/containers/json?all=true&filters="+f, nil, &cs); err != nil {
		return nil, nil, err
	}
	var ns []struct {
		ID string `json:"Id"`
	}
	if err = c.do(ctx, http.MethodGet, "/networks?filters="+f, nil, &ns); err != nil {
		return nil, nil, err
	}
	for _, x := range cs {
		containers = append(containers, x.ID)
	}
	for _, x := range ns {
		networks = append(networks, x.ID)
	}
	return containers, networks, nil
}
