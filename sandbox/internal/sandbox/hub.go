package sandbox

import "sync"

// Event — то, что видит окно Docker: смена статуса контейнера, строка лога,
// готовность или остановка стека.
type Event struct {
	Type    string `json:"type"` // state | log | ready | error | stopped
	Service string `json:"service,omitempty"`
	Status  string `json:"status,omitempty"`
	Text    string `json:"text,omitempty"`
}

const maxLogHistory = 500

// hub хранит историю событий для тех, кто подписался позже,
// и раздаёт новые события подписчикам.
type hub struct {
	mu      sync.Mutex
	history []Event
	logs    int
	subs    map[chan Event]struct{}
	closed  bool
}

func newHub() *hub { return &hub{subs: map[chan Event]struct{}{}} }

func (h *hub) emit(e Event) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.closed {
		return
	}
	if e.Type == "log" {
		if h.logs >= maxLogHistory {
			h.dropOldestLog()
		} else {
			h.logs++
		}
	}
	h.history = append(h.history, e)
	for ch := range h.subs {
		select {
		case ch <- e:
		default:
			// Медленный клиент: отключаем, браузер переподключится и получит историю.
			delete(h.subs, ch)
			close(ch)
		}
	}
}

func (h *hub) dropOldestLog() {
	for i, e := range h.history {
		if e.Type == "log" {
			h.history = append(h.history[:i], h.history[i+1:]...)
			return
		}
	}
}

// subscribe возвращает историю и канал новых событий. Канал закрывается
// при close() или если клиент не успевает читать.
func (h *hub) subscribe() ([]Event, chan Event, func()) {
	h.mu.Lock()
	defer h.mu.Unlock()
	ch := make(chan Event, 256)
	snapshot := append([]Event(nil), h.history...)
	if h.closed {
		close(ch)
		return snapshot, ch, func() {}
	}
	h.subs[ch] = struct{}{}
	return snapshot, ch, func() {
		h.mu.Lock()
		defer h.mu.Unlock()
		if _, ok := h.subs[ch]; ok {
			delete(h.subs, ch)
			close(ch)
		}
	}
}

func (h *hub) close() {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.closed = true
	for ch := range h.subs {
		close(ch)
	}
	h.subs = map[chan Event]struct{}{}
}
