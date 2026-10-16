package docker

import (
	"bufio"
	"encoding/binary"
	"io"
	"strings"
)

// Demux разбирает мультиплексированный поток логов Docker (контейнер без TTY):
// каждый кадр — 8 байт заголовка (поток, 0, 0, 0, длина big-endian) и данные.
// Для каждой строки вызывается fn; неполная строка ждёт следующего кадра.
func Demux(r io.Reader, fn func(line string)) error {
	br := bufio.NewReader(r)
	var hdr [8]byte
	var pending strings.Builder
	for {
		if _, err := io.ReadFull(br, hdr[:]); err != nil {
			if pending.Len() > 0 {
				fn(pending.String())
			}
			if err == io.EOF || err == io.ErrUnexpectedEOF {
				return nil
			}
			return err
		}
		size := binary.BigEndian.Uint32(hdr[4:])
		buf := make([]byte, size)
		if _, err := io.ReadFull(br, buf); err != nil {
			return err
		}
		pending.Write(buf)
		text := pending.String()
		pending.Reset()
		for {
			i := strings.IndexByte(text, '\n')
			if i < 0 {
				pending.WriteString(text)
				break
			}
			fn(strings.TrimRight(text[:i], "\r"))
			text = text[i+1:]
		}
	}
}
