package docker

import (
	"bytes"
	"encoding/binary"
	"reflect"
	"testing"
)

func frame(stream byte, s string) []byte {
	h := make([]byte, 8)
	h[0] = stream
	binary.BigEndian.PutUint32(h[4:], uint32(len(s)))
	return append(h, s...)
}

func TestDemux(t *testing.T) {
	var buf bytes.Buffer
	buf.Write(frame(1, "first line\nsecond "))
	buf.Write(frame(2, "half\r\nthird"))
	buf.Write(frame(1, " end\n"))
	buf.Write(frame(1, "no newline at eof"))

	var got []string
	if err := Demux(&buf, func(l string) { got = append(got, l) }); err != nil {
		t.Fatal(err)
	}
	want := []string{"first line", "second half", "third end", "no newline at eof"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %q, want %q", got, want)
	}
}
