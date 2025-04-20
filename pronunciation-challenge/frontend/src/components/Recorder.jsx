// frontend/src/components/Recorder.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SENTENCES = [
  '안녕하세요.',
  '저는 리나라고 해요.',
  '식사 하셨어요?',
  '토끼가 뛰어가요.',
  '맘모스빵은 맛있어요.',
  '오늘 날씨가 좋네요.',
  '이 책은 정말 재미있어요.',
  '저는 한국어를 배우고 있어요.',
  '여행을 가고 싶어요.',
  '영화관에 가고 싶어요.',
  '얘는 제 친구예요.',
  '이것은 제 가방이에요.',
  '저는 매일 운동해요.',
  '이 음식은 정말 맛있어요.',
  '저는 음악을 좋아해요.',
  '이곳은 정말 아름다워요.',
  '저는 한국 드라마를 좋아해요.',
  '이 영화는 정말 감동적이에요.',
  '저는 매일 아침에 일어나요.',
  '이곳은 정말 조용해요.',
  '저는 매일 저녁에 운동해요.',
  '이곳은 정말 시끄러워요.',
  '저는 매일 저녁에 책을 읽어요.',
];

export default function Recorder() {
  const [script, setScript] = useState('');
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    pickRandomSentence();
  }, []);

  const pickRandomSentence = () => {
    const idx = Math.floor(Math.random() * SENTENCES.length);
    setScript(SENTENCES[idx]);
    setEvaluation(null);
    setAudioUrl('');
    setError('');
  };

  function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (off, str) => str.split('').forEach((ch, i) => view.setUint8(off + i, ch.charCodeAt(0)));
    writeString(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE'); writeString(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeString(36, 'data'); view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    samples.forEach(s => {
      const v = Math.max(-1, Math.min(1, s));
      view.setInt16(offset, v < 0 ? v * 0x8000 : v * 0x7FFF, true);
      offset += 2;
    });
    return new Blob([view], { type: 'audio/wav' });
  }

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new AudioContext();
        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        const offlineCtx = new OfflineAudioContext(1, decoded.length * 16000 / decoded.sampleRate, 16000);
        const src = offlineCtx.createBufferSource(); src.buffer = decoded; src.connect(offlineCtx.destination); src.start();
        const rendered = await offlineCtx.startRendering();
        const wavBlob = encodeWAV(rendered.getChannelData(0), 16000);
        setAudioUrl(URL.createObjectURL(wavBlob));
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            const { data } = await axios.post('http://localhost:3000/evaluate', {
              request_id: Date.now().toString(),
              argument: { language_code: 'korean', script, audio: base64 }
            });
            setEvaluation(data.return_object);
          } catch {
            setError('evaluation error');
          }
        };
        reader.readAsDataURL(wavBlob);
      };
      recorder.start(); setRecording(true);
    } catch {
      setError('Mic permission denied');
    }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <h1 className="text-2xl font-bold text-center">Pronunciation Evaluation </h1>
      <div className="text-center">
        <p className="text-lg mb-2">Sentence: </p>
        <p className="text-blue-600 font-semibold">{script}</p>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`px-6 py-2 rounded-lg font-medium shadow ${recording ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >{recording ? 'Recording Stop' : 'Recording Start'}</button>
        <button
          onClick={pickRandomSentence}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow"
        >New Sentence</button>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {audioUrl && <audio controls src={audioUrl} className="w-full mt-4" />}
      {evaluation && (
        <div className="bg-gray-100 rounded-lg p-4 space-y-2">
          <h2 className="text-xl font-semibold">Result</h2>
          <p>Sentence: <span className="text-blue-600">{evaluation.recognized}</span></p>
          <p>Score: <span className="text-green-600 font-bold">{Math.round(parseFloat(evaluation.score) * 10) / 10}</span> / 5</p>
        </div>
      )}
    </div>
  );
}