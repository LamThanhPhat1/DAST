import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3, Factory, Globe2, RotateCcw, TrendingUp, Users, Cpu, Coins,
  ArrowRight, PiggyBank, AlertTriangle, HelpCircle, BookOpen, CheckCircle2,
  Award, Lock, Trophy, Sparkles, Shuffle, Sun, Moon, Monitor, Palette, Check,
  ChevronDown, ChevronUp, X
} from "lucide-react";
import "./style.css";
import * as E from "./engine.js";

const { TOTAL_ROUNDS, QUIZ_BONUS, STAGES, BADGES, actions, actionLessons } = E;

const actionIcons = { technology: Cpu, human: Users, market: Globe2, overhaul: Sparkles, reserve: PiggyBank };

// ===== Lưu trữ cục bộ (kỷ lục, chủ đề) =====
const BEST_KEY = "sme-mekong-best";
function loadBest() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
}
function saveBest(v) {
  try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* bỏ qua */ }
}

const THEME_KEY = "sme-mekong-theme";
const DEFAULT_THEME = { mode: "light", accent: "green" };
const MODES = [["light", "Sáng", Sun], ["dark", "Tối", Moon], ["auto", "Tự động", Monitor]];
const ACCENTS = [["green", "Mekong", "#16a06d"], ["blue", "Sông nước", "#2f7fd6"], ["amber", "Phù sa", "#d9822b"]];

function loadTheme() {
  try {
    const t = JSON.parse(localStorage.getItem(THEME_KEY));
    if (t && MODES.some(([id]) => id === t.mode) && ACCENTS.some(([id]) => id === t.accent)) return t;
  } catch { /* bỏ qua */ }
  return DEFAULT_THEME;
}
function saveTheme(t) {
  try { localStorage.setItem(THEME_KEY, JSON.stringify(t)); } catch { /* bỏ qua */ }
}
function applyTheme(t) {
  const prefersDark = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = t.mode === "dark" || (t.mode === "auto" && prefersDark);
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.accent = t.accent;
}
applyTheme(loadTheme()); // áp dụng trước khi vẽ để tránh nháy màu

const GUIDE_KEY = "sme-mekong-guide-seen";
function guideSeen() {
  try { return localStorage.getItem(GUIDE_KEY) === "1"; } catch { return false; }
}
function markGuideSeen() {
  try { localStorage.setItem(GUIDE_KEY, "1"); } catch { /* bỏ qua */ }
}

const STAT_LABEL = { technology: "Công nghệ", human: "Nhân lực", market: "Thị trường" };
function previewText(key, pv) {
  if (key === "reserve") return "Vốn +40 triệu · mọi chỉ số -2";
  if (key === "overhaul") return `Thành công: Công nghệ +${pv.ok.technology}, Nhân lực +${pv.ok.human}, Thị trường +${pv.ok.market}`;
  return `Thành công: ${STAT_LABEL[key]} +${pv.ok[key]} · Thất bại: +${pv.fail[key]}`;
}

// Cuộn mượt tới một phần tử sau khi giao diện đã vẽ xong.
function jumpTo(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, 90);
}

function ThemeMenu({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="theme-wrap" ref={ref}>
      <button className="theme-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog">
        <Palette size={16} /> <span>Chủ đề</span>
      </button>
      {open && (
        <div className="theme-pop" role="dialog" aria-label="Chọn chủ đề">
          <p className="pop-label">CHẾ ĐỘ</p>
          <div className="seg">
            {MODES.map(([id, label, Icon]) => (
              <button key={id} className={theme.mode === id ? "on" : ""} onClick={() => setTheme((t) => ({ ...t, mode: id }))}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          <p className="pop-label">MÀU CHỦ ĐẠO</p>
          <div className="swatches">
            {ACCENTS.map(([id, label, color]) => (
              <button key={id} className={theme.accent === id ? "swatch on" : "swatch"} onClick={() => setTheme((t) => ({ ...t, accent: id }))}>
                <span style={{ background: color }}>{theme.accent === id && <Check size={15} />}</span>
                <small>{label}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const FX_NAME = { capital: "Vốn", technology: "Công nghệ", human: "Nhân lực", market: "Thị trường" };

function FxChips({ fx }) {
  const items = Object.entries(fx).filter(([, v]) => v);
  if (!items.length) return <span className="fx none">Không thay đổi</span>;
  return items.map(([k, v]) => (
    <span key={k} className={"fx " + (v > 0 ? "up" : "down")}>
      {FX_NAME[k]} {v > 0 ? "+" : "−"}{Math.abs(v)}{k === "capital" ? " triệu" : ""}
    </span>
  ));
}

// Kết quả vòng trước, hiện đầu cửa sổ sự kiện của vòng mới
function PrevResult({ last }) {
  const label = last.action === "reserve" ? "Dự trữ" : last.success ? "Thành công" : "Thất bại";
  const cls = last.action === "reserve" ? "pill" : last.success ? "pill ok" : "pill bad";
  return (
    <div className={last.success ? "prev-result" : "prev-result fail"}>
      <div className="prev-line">
        <span className={cls}>{label}</span>
        <b>Vòng {last.round}: {actions[last.action].title}</b>
        <span className="prev-profit">Lợi nhuận {last.profit >= 0 ? "+" : ""}{last.profit} triệu</span>
      </div>
      {last.newBadges.length > 0 && (
        <div className="prev-line"><span className="pill gold"><Award size={12} /> Mở khóa danh hiệu: {last.newBadges.join(", ")}</span></div>
      )}
      <details>
        <summary>Bài học vòng trước</summary>
        {last.action !== "reserve" && (
          <p className={last.success ? "tone-ok" : "tone-bad"}>
            {last.success ? "Đầu tư thành công." : `Đầu tư thất bại. ${last.failNote}`} (xác suất thành công {Math.round(last.chance * 100)}%)
          </p>
        )}
        <p>{actionLessons[last.action].text}</p>
        <p><b>{last.eventTitle}:</b> {last.eventNote}</p>
      </details>
    </div>
  );
}

// Cửa sổ từng bước của vòng chơi: sự kiện, tình huống bất ngờ, câu hỏi.
function FlowModal({ phase, state, readonly = false, onContinue, onChoose, onAnswer }) {
  const btnRef = useRef(null);
  useEffect(() => {
    if (btnRef.current) btnRef.current.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, []);

  const hasChoice = !!state.choice;
  const total = 2 + (hasChoice ? 1 : 0);
  const kind = phase.startsWith("choice") ? "choice" : phase.startsWith("quiz") ? "quiz" : "event";
  const stepNo = kind === "event" ? 1 : kind === "choice" ? 2 : hasChoice ? 3 : 2;
  const META = {
    event: { tone: "warn", Icon: AlertTriangle, label: `SỰ KIỆN THỊ TRƯỜNG · VÒNG ${state.round}` },
    choice: { tone: "purple", Icon: Shuffle, label: "TÌNH HUỐNG BẤT NGỜ" },
    quiz: { tone: "accent", Icon: HelpCircle, label: "CÂU HỎI KIẾN THỨC" },
  };
  const meta = META[kind];
  const Icon = meta.Icon;
  const q = state.quiz.item;
  const quizOk = state.quiz.picked !== null && state.quiz.picked === q.answer;
  const letter = (i) => String.fromCharCode(65 + i);
  const continueLabel = readonly ? "Đóng" : phase === "quiz-result" ? "Tiếp tục đến phần đầu tư" : "Tiếp tục";

  return (
    <div className="modal-back flow" onMouseDown={(e) => { if (readonly && e.target === e.currentTarget) onContinue(); }}>
      <div className={"modal flow-modal t-" + meta.tone} role="dialog" aria-modal="true" aria-label={meta.label}>
        <div className="flow-head">
          <span className="flow-ic"><Icon size={20} /></span>
          <div>
            <small>{meta.label}</small>
            {!readonly && <span className="flow-step">Bước {stepNo}/{total}</span>}
          </div>
        </div>

        <div className="m-status" aria-label="Tình hình hiện tại">
          <span><small>Vốn</small><b>{state.capital}</b></span>
          <span><small>Cạnh tranh</small><b>{state.competition}</b></span>
          <span><small>Công nghệ</small><b>{state.technology}</b></span>
          <span><small>Nhân lực</small><b>{state.human}</b></span>
          <span><small>Thị trường</small><b>{state.market}</b></span>
        </div>

        <div className="flow-body">
          {phase === "event" && (
            <>
              {!readonly && state.last && <PrevResult last={state.last} />}
              <h3 className="flow-title">{state.event.title}</h3>
              <p className="flow-desc">{state.event.desc}</p>
              <div className="cond-box">
                <small>ĐIỀU KIỆN THƯỞNG HOẶC PHẠT</small>
                <p>{state.event.hint}</p>
                <em>Được tính sau khi bạn đầu tư xong vòng này, nên hãy cân nhắc trước khi chọn.</em>
              </div>
            </>
          )}

          {phase === "choice" && (
            <>
              <h3 className="flow-title">{state.choice.item.title}</h3>
              <p className="flow-desc">{state.choice.item.desc}</p>
              <div className="flow-options">
                {state.choice.item.options.map((opt, i) => {
                  const noMoney = state.capital <= E.choiceNeed(opt);
                  return (
                    <button key={i} className="flow-opt purple" onClick={() => onChoose(i)} disabled={noMoney}>
                      <div>
                        <b>{opt.label}</b>
                        {noMoney ? <em>Không đủ vốn</em> : opt.outcomes.length === 1 ? (
                          <div className="fx-row"><FxChips fx={opt.outcomes[0].fx} /></div>
                        ) : (
                          <><em>{opt.hint}</em><span className="gamble">May rủi</span></>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {phase === "choice-result" && state.choice.picked !== null && (
            <>
              <h3 className="flow-title">{state.choice.item.title}</h3>
              <p className="flow-desc">Bạn chọn: <b>{state.choice.item.options[state.choice.picked].label}</b></p>
              <div className="result-box">
                <b>{state.choice.result.text}</b>
                <div className="fx-row"><FxChips fx={state.choice.result.fx} /></div>
              </div>
              <p className="learn">{state.choice.item.learn}</p>
            </>
          )}

          {phase === "quiz" && (
            <>
              <h3 className="flow-title q">{q.q}</h3>
              <div className="flow-options">
                {q.options.map((opt, i) => (
                  <button key={i} className="flow-opt" onClick={() => onAnswer(i)}>
                    <span className="letter">{letter(i)}</span>
                    <div><b>{opt}</b></div>
                  </button>
                ))}
              </div>
              <div className="fx-row reward">
                <span className="fx up">Đúng: +{QUIZ_BONUS} triệu</span>
                <span className="fx up">+10% tỷ lệ thành công vòng này</span>
              </div>
            </>
          )}

          {phase === "quiz-result" && state.quiz.picked !== null && (
            <>
              <div className={quizOk ? "verdict ok" : "verdict bad"}>
                {quizOk ? `Chính xác! +${QUIZ_BONUS} triệu và +10% tỷ lệ thành công vòng này.` : "Chưa đúng."}
              </div>
              <p className="flow-desc"><b>{q.q}</b></p>
              <p className="flow-desc">
                Đáp án đúng: <b>{letter(q.answer)}. {q.options[q.answer]}</b>
                {!quizOk && <> · Bạn chọn: {letter(state.quiz.picked)}. {q.options[state.quiz.picked]}</>}
              </p>
              <div className="explain-box">{q.explain}</div>
            </>
          )}
        </div>

        <div className="flow-foot">
          {phase === "choice" && <span className="hint">Chọn một phương án để tiếp tục.</span>}
          {phase === "quiz" && <span className="hint">Trả lời để mở khóa phần đầu tư.</span>}
          {phase !== "choice" && phase !== "quiz" && (
            <button className="primary flow-btn" ref={btnRef} onClick={onContinue}>
              {continueLabel} {!readonly && <ArrowRight size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Ring({ value }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={`Năng lực cạnh tranh ${value} trên 100`}>
      <svg viewBox="0 0 100 100">
        <circle className="track" cx="50" cy="50" r={r} fill="none" strokeWidth="9" />
        <circle className="prog" cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="ring-text"><b>{value}</b><small>/100</small></div>
    </div>
  );
}

function Meter({ icon: Icon, label, value, delta = 0 }) {
  const base = delta < 0 ? value + delta : value;
  return (
    <div className="meter">
      <div className="meter-row">
        <span><Icon size={14} /> {label}</span>
        <b>{value}{delta !== 0 && <em className={delta > 0 ? "pv up" : "pv down"}>{delta > 0 ? "+" : ""}{delta}</em>}</b>
      </div>
      <div className="bar">
        <i style={{ width: `${base}%` }}></i>
        {delta !== 0 && <u className={delta > 0 ? "ghost up" : "ghost down"} style={{ left: `${base}%`, width: `${Math.abs(delta)}%` }}></u>}
      </div>
    </div>
  );
}

function GuideModal({ onClose, onTheory }) {
  const [tab, setTab] = useState("rules");
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current && closeRef.current.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = old;
    };
  }, [onClose]);
  const R = E.RATE;
  return (
    <div className="modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Cẩm nang">
        <div className="modal-head">
          <h3><BookOpen size={19} /> Cẩm nang</h3>
          <button className="icon-btn" ref={closeRef} onClick={onClose} aria-label="Đóng"><X size={18} /></button>
        </div>
        <div className="tabs-mini">
          <button className={tab === "rules" ? "on" : ""} onClick={() => setTab("rules")}>Luật chơi</button>
          <button className={tab === "theory" ? "on" : ""} onClick={() => setTab("theory")}>Cơ sở lý luận</button>
        </div>
        <div className="modal-body">
          {tab === "rules" ? (
            <>
              <h4>Mục tiêu</h4>
              <p>Điều hành một doanh nghiệp nông sản qua {TOTAL_ROUNDS} vòng: dùng lợi nhuận để tái đầu tư, nâng năng lực cạnh tranh và giữ vốn khỏe để đứng vững khi hội nhập.</p>
              <h4>Mỗi vòng</h4>
              <ol>
                <li>Một cửa sổ hiện sự kiện thị trường. Điều kiện thưởng hoặc phạt được tính sau khi bạn đầu tư.</li>
                <li>Nếu có tình huống bất ngờ, chọn một phương án. Kết quả có thể may rủi.</li>
                <li>Trả lời câu hỏi kiến thức: đúng được +{QUIZ_BONUS} triệu và +10% tỷ lệ thành công.</li>
                <li>Chọn hướng đầu tư. Rê chuột vào một thẻ để xem trước tác động lên các chỉ số.</li>
              </ol>
              <h4>Rủi ro và chi phí</h4>
              <ul>
                <li>Đầu tư có thể thất bại: vẫn mất vốn, chỉ nhận một phần nhỏ hiệu quả.</li>
                <li>Mỗi lần đầu tư vào cùng một hướng, lần sau đắt hơn.</li>
                <li>Chỉ số không được đầu tư xuống cấp nhẹ mỗi vòng, giống máy móc hao mòn.</li>
                <li>Chuyển đổi toàn diện nâng cả ba chỉ số, nhưng đắt dần, dễ thất bại hơn và phải chờ 2 lượt mới dùng lại. Đây là cách duy nhất để chạm 100/100.</li>
                <li>Mỗi danh hiệu tăng thêm 3% tỷ lệ thành công và có thưởng riêng.</li>
              </ul>
              <h4>Thắng và thua</h4>
              <p>Cuối game, xếp hạng theo năng lực cạnh tranh và vốn: <b>Hoàn hảo</b> (100), <b>Xuất sắc</b> (từ {R.excellent}), <b>Rất tốt</b> (từ {R.top.c} và vốn từ {R.top.cap} triệu), <b>Khá tốt</b> (từ {R.good}), <b>Cần cải thiện</b> (từ {R.ok}), còn lại là <b>Tụt hậu</b>. Vốn về 0 là <b>phá sản</b>.</p>
            </>
          ) : (
            <>
              <h4>Tích lũy tư bản</h4>
              <p>Chuyển hóa một phần giá trị thặng dư thành tư bản phụ thêm để mở rộng sản xuất. Trong game: lợi nhuận mỗi vòng được tái đầu tư.</p>
              <h4>Nhân tố ảnh hưởng quy mô tích lũy</h4>
              <p>Trình độ khai thác sức lao động, năng suất lao động, hiệu quả sử dụng máy móc và đại lượng tư bản ứng trước. Trong game: nhân lực, công nghệ và vốn.</p>
              <h4>Cạnh tranh</h4>
              <p>Doanh nghiệp cải tiến kỹ thuật, nâng năng suất để hạ giá trị cá biệt xuống thấp hơn giá trị xã hội và thu lợi nhiều hơn.</p>
              <h4>Hội nhập kinh tế quốc tế</h4>
              <p>Mở rộng thị trường và tiếp cận công nghệ, vốn, nhưng cạnh tranh gay gắt hơn và phụ thuộc thị trường bên ngoài.</p>
              <button className="secondary" onClick={onTheory}>Mở trang Lý luận đầy đủ</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [state, setState] = useState(E.makeInitial);
  const [best, setBest] = useState(loadBest);
  const [newRecord, setNewRecord] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [sideTab, setSideTab] = useState("badges");
  const [reviewTab, setReviewTab] = useState("quiz");
  const [guideOpen, setGuideOpen] = useState(false);
  const [hoverAct, setHoverAct] = useState(null);
  const [ack, setAck] = useState({ event: 0, choice: 0, quiz: 0 }); // vòng mà người chơi đã xác nhận từng bước
  const [view, setView] = useState(null); // xem lại sự kiện, tình huống hoặc lời giải
  const guideChecked = useRef(false);
  const prev = useRef({ page: "home", round: 1, finished: false, flowDone: false });

  const result = E.rate(state);
  const score = E.calcScore(state);
  const stageIdx = E.stageOf(state.round);

  const eventDone = ack.event === state.round;
  const choiceDone = !state.choice || (state.choice.picked !== null && ack.choice === state.round);
  const quizDone = state.quiz.picked !== null && ack.quiz === state.round;
  const flowDone = eventDone && choiceDone && quizDone;
  const ready = flowDone;
  const quizOk = state.quiz.picked !== null && state.quiz.picked === state.quiz.item.answer;
  // Cửa sổ nào đang cần người chơi xử lý
  let phase = null;
  if (page === "simulation" && !state.finished && !guideOpen) {
    if (!eventDone) phase = "event";
    else if (state.choice && state.choice.picked === null) phase = "choice";
    else if (state.choice && ack.choice !== state.round) phase = "choice-result";
    else if (state.quiz.picked === null) phase = "quiz";
    else if (ack.quiz !== state.round) phase = "quiz-result";
  }

  // Chủ đề: áp dụng, lưu, và theo dõi chế độ tự động của hệ điều hành
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
    if (theme.mode !== "auto" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => applyTheme(theme);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [theme]);

  useEffect(() => {
    if (!state.finished) return;
    const sc = E.calcScore(state);
    if (sc > best) {
      setBest(sc);
      saveBest(sc);
      setNewRecord(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finished]);

  // Tự cuộn: tới phần đầu tư khi xong các cửa sổ, tới kết quả khi hết game.
  useEffect(() => {
    const p = prev.current;
    const now = { page, round: state.round, finished: state.finished, flowDone };
    prev.current = now;
    if (page !== "simulation" || p.page !== "simulation") return;
    if (state.round < p.round || (p.finished && !state.finished)) {
      window.scrollTo({ top: 0, behavior: "auto" }); // chơi lại
    } else if (state.finished && !p.finished) {
      jumpTo("sim-result");
    } else if (state.round === p.round && !p.flowDone && flowDone) {
      jumpTo("sim-actions");
    }
  }, [state, page, flowDone]);

  // Lần đầu vào trang mô phỏng thì mở cẩm nang
  useEffect(() => {
    if (page !== "simulation" || guideChecked.current) return;
    guideChecked.current = true;
    if (!guideSeen()) {
      setGuideOpen(true);
      markGuideSeen();
    }
  }, [page]);

  // Mỗi khi có kết quả mới, thu gọn phần bài học (người chơi tự mở nếu muốn đọc)
  useEffect(() => { setLessonOpen(false); }, [state.last]);

  function reset() {
    setState(E.makeInitial());
    setNewRecord(false);
    setSideTab("badges");
    setReviewTab("quiz");
    setHoverAct(null);
    setAck({ event: 0, choice: 0, quiz: 0 });
    setView(null);
    setPage("simulation");
  }

  const steps = [
    { label: "Sự kiện", done: eventDone },
    ...(state.choice ? [{ label: "Tình huống", done: choiceDone }] : []),
    { label: "Câu hỏi", done: quizDone },
    { label: "Đầu tư", done: false },
  ];
  const curStep = steps.findIndex((s) => !s.done);
  const sign = (n) => (n >= 0 ? "+" : "");
  const onContinue = () => {
    if (phase === "event") setAck((a) => ({ ...a, event: state.round }));
    else if (phase === "choice-result") setAck((a) => ({ ...a, choice: state.round }));
    else if (phase === "quiz-result") setAck((a) => ({ ...a, quiz: state.round }));
  };
  const pv = hoverAct && ready && !state.finished ? E.previewAction(hoverAct, state) : null;
  const predComp = pv
    ? E.calcCompetition({
        technology: E.clamp(state.technology + pv.ok.technology),
        human: E.clamp(state.human + pv.ok.human),
        market: E.clamp(state.market + pv.ok.market),
      })
    : null;
  const style = state.finished ? E.playStyle(state) : null;

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon"><Factory size={24} /></div>
          <div>
            <h1>SME Mekong</h1>
            <p>Mô phỏng năng lực cạnh tranh</p>
          </div>
        </div>

        <div className="header-right">
          <nav>
            <button className={page === "home" ? "nav active" : "nav"} onClick={() => setPage("home")}>Giới thiệu</button>
            <button className={page === "simulation" ? "nav active" : "nav"} onClick={() => setPage("simulation")}>Mô phỏng</button>
            <button className={page === "theory" ? "nav active" : "nav"} onClick={() => setPage("theory")}>Lý luận</button>
          </nav>
          <ThemeMenu theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="container">
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="badge">SẢN PHẨM SÁNG TẠO</span>
                <h2>Từ tích lũy đến<br /><span>năng lực cạnh tranh</span></h2>
                <p>
                  Trải nghiệm mô phỏng cách doanh nghiệp nhỏ và vừa ở ĐBSCL
                  sử dụng lợi nhuận để tái đầu tư, mở rộng sản xuất và thích ứng
                  với hội nhập kinh tế quốc tế.
                </p>
                <button className="primary" onClick={() => setPage("simulation")}>
                  Bắt đầu mô phỏng <ArrowRight size={18} />
                </button>
              </div>
              <div className="hero-visual">
                <div className="circle c1"></div>
                <div className="circle c2"></div>
                <Factory size={110} strokeWidth={1.3} />
                <div className="floating-card">
                  <TrendingUp size={20} />
                  <div><b>{TOTAL_ROUNDS} vòng</b><small>Mỗi quyết định đều có đánh đổi</small></div>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-title">
                <span>QUY TRÌNH</span>
                <h3>Từ lợi nhuận đến mở rộng sản xuất</h3>
              </div>
              <div className="steps">
                {[
                  ["01", "Sản xuất", "Tạo ra sản phẩm và doanh thu."],
                  ["02", "Lợi nhuận", "Hình thành nguồn tích lũy."],
                  ["03", "Tái đầu tư", "Chuyển một phần lợi nhuận thành vốn mới."],
                  ["04", "Cạnh tranh", "Nâng năng suất và mở rộng thị trường."]
                ].map(([num, title, text]) => (
                  <div className="step" key={num}>
                    <span>{num}</span><h4>{title}</h4><p>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-title">
                <span>CÁCH CHƠI</span>
                <h3>{TOTAL_ROUNDS} vòng, 3 giai đoạn</h3>
              </div>
              <div className="steps">
                {[
                  ["1", "Đọc sự kiện", "Mỗi vòng có một biến động thị trường, đôi khi kèm tình huống bất ngờ cần bạn chọn."],
                  ["2", "Trả lời câu hỏi", "Đúng được thưởng vốn và tăng tỷ lệ thành công, lời giải thường gợi ý cách ứng phó."],
                  ["3", "Chọn đầu tư", "Có thể thất bại, và mỗi lần chi vào cùng một hướng sẽ đắt hơn. Chỉ số bị bỏ bê xuống cấp nhẹ."],
                  ["4", "Mở danh hiệu", "Đạt ngưỡng chỉ số để nhận thưởng vĩnh viễn. Dùng chuyển đổi toàn diện đúng lúc để hướng tới 100/100."]
                ].map(([num, title, text]) => (
                  <div className="step" key={num}>
                    <span>{num}</span><h4>{title}</h4><p>{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "simulation" && (
          <>
            <div className="mini-hud" aria-label="Tình hình doanh nghiệp">
              <span className="hud-chip"><Coins size={13} /> {state.capital} triệu</span>
              <span className="hud-chip"><BarChart3 size={13} /> {state.competition}/100</span>
              <span className="hud-chip">Công nghệ {state.technology}</span>
              <span className="hud-chip">Nhân lực {state.human}</span>
              <span className="hud-chip">Thị trường {state.market}</span>
            </div>

            <section className="sim-head">
              <div className="sim-title">
                <span className="eyebrow">MÔ PHỎNG DOANH NGHIỆP</span>
                <h2>Công ty Nông sản Mekong</h2>
              </div>
              <div className="head-actions">
                <button className="secondary" onClick={() => setGuideOpen(true)}><BookOpen size={16} /> Cẩm nang</button>
                <button className="secondary" onClick={reset}><RotateCcw size={16} /> Chơi lại</button>
              </div>
              <div className="tracker">
                {STAGES.map((st, si) => {
                  const rounds = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).filter((r) => E.stageOf(r) === si);
                  return (
                    <div key={si} className={si === stageIdx ? "t-stage active" : "t-stage"} style={{ flex: rounds.length }}>
                      <small>{st.name}</small>
                      <div className="t-segs">
                        {rounds.map((n) => {
                          const cls = n < state.round || state.finished ? "rseg done" : n === state.round ? "rseg current" : "rseg";
                          return <span key={n} className={cls}>{n}</span>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="stage-goal"><b>Giai đoạn {stageIdx + 1}/3 · {STAGES[stageIdx].name}.</b> {STAGES[stageIdx].goal}</p>
            </section>

            <div className="sim-layout">
              <div className="sim-main">
                {state.last && (
                  <section id="sim-lesson" className={state.last.success ? "last-card" : "last-card fail"}>
                    <button className="last-head" onClick={() => setLessonOpen((o) => !o)} aria-expanded={lessonOpen}>
                      <span className={state.last.action === "reserve" ? "pill" : state.last.success ? "pill ok" : "pill bad"}>
                        {state.last.action === "reserve" ? "Dự trữ" : state.last.success ? "Thành công" : "Thất bại"}
                      </span>
                      <span className="last-title">Vòng {state.last.round}: {actions[state.last.action].title}</span>
                      <span className="last-profit">Lợi nhuận {sign(state.last.profit)}{state.last.profit} triệu</span>
                      {state.last.newBadges.length > 0 && (
                        <span className="pill gold"><Award size={12} /> {state.last.newBadges.join(", ")}</span>
                      )}
                      <span className="last-toggle"><BookOpen size={14} /> Bài học {lessonOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                    </button>
                    {lessonOpen && (
                      <div className="last-body">
                        {state.last.action !== "reserve" && (
                          <p className={state.last.success ? "tone-ok" : "tone-bad"}>
                            {state.last.success ? "Đầu tư thành công." : `Đầu tư thất bại. ${state.last.failNote}`} (xác suất thành công {Math.round(state.last.chance * 100)}%)
                          </p>
                        )}
                        <p>{actionLessons[state.last.action].text}</p>
                        <p><b>{state.last.eventTitle}:</b> {state.last.eventNote}</p>
                      </div>
                    )}
                  </section>
                )}

                {!state.finished && (
                  <section id="sim-turn" className="turn-card">
                    <div className="turn-head">
                      <h3>Vòng {state.round}<span>/{TOTAL_ROUNDS}</span></h3>
                      <ol className="stepper">
                        {steps.map((s, i) => (
                          <li key={s.label} className={"step-chip" + (s.done ? " done" : "") + (i === curStep ? " current" : "")}>
                            <i>{s.done ? <Check size={12} /> : i + 1}</i>{s.label}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {eventDone && (
                      <div id="sim-event" className="recap warn">
                        <span className="recap-ic"><AlertTriangle size={16} /></span>
                        <div className="recap-main">
                          <small>SỰ KIỆN VÒNG NÀY</small>
                          <b>{state.event.title}</b>
                          <span>{state.event.hint}</span>
                        </div>
                        <button className="linkbtn" onClick={() => setView("event")}>Xem lại</button>
                      </div>
                    )}

                    {state.choice && choiceDone && (
                      <div className="recap purple">
                        <span className="recap-ic"><Shuffle size={16} /></span>
                        <div className="recap-main">
                          <small>TÌNH HUỐNG BẤT NGỜ</small>
                          <b>{state.choice.item.title}</b>
                          <span>Bạn chọn «{state.choice.item.options[state.choice.picked].label}» · {E.fxText(state.choice.result.fx)}</span>
                        </div>
                        <button className="linkbtn" onClick={() => setView("choice")}>Xem lại</button>
                      </div>
                    )}

                    {quizDone && (
                      <div className={quizOk ? "recap ok" : "recap bad"}>
                        <span className="recap-ic"><HelpCircle size={16} /></span>
                        <div className="recap-main">
                          <small>CÂU HỎI KIẾN THỨC</small>
                          <b>{quizOk ? "Chính xác!" : "Chưa đúng."}</b>
                          <span>
                            {quizOk
                              ? `+${QUIZ_BONUS} triệu và +10% tỷ lệ thành công vòng này`
                              : `Đáp án đúng: ${String.fromCharCode(65 + state.quiz.item.answer)}. ${state.quiz.item.options[state.quiz.item.answer]}`}
                          </span>
                        </div>
                        <button className="linkbtn" onClick={() => setView("quiz")}>Xem lời giải</button>
                      </div>
                    )}

                    {ready ? (
                      <div id="sim-actions" className="step-box act-box">
                        <div className="box-title"><TrendingUp size={16} /> Quyết định đầu tư</div>
                        <div className="act-grid">
                          {Object.entries(actions).map(([key, item]) => {
                            const Icon = actionIcons[key];
                            const cost = E.costOf(key, state);
                            const noMoney = state.capital < cost;
                            const locked = E.lockReason(key, state);
                            const chance = Math.round(E.successChance(key, state) * 100);
                            return (
                              <button className={key === "overhaul" ? "act-card special" : "act-card"} key={key}
                                onClick={() => { setHoverAct(null); setState((s) => E.invest(s, key)); }}
                                onMouseEnter={() => setHoverAct(key)} onMouseLeave={() => setHoverAct(null)}
                                onFocus={() => setHoverAct(key)} onBlur={() => setHoverAct(null)}
                                disabled={noMoney || !!locked}>
                                <div className="act-top">
                                  <span className="act-icon">{locked ? <Lock size={18} /> : <Icon size={18} />}</span>
                                  <h4>{item.title}</h4>
                                </div>
                                <p>{item.desc}</p>
                                <div className="act-meta">
                                  <span className="chip">{cost ? `Chi ${cost} triệu` : "Không tốn vốn"}</span>
                                  {key !== "reserve" && !locked && <span className="chip ok">Thành công {chance}%</span>}
                                  {locked && <span className="chip warn">{locked}</span>}
                                  {noMoney && !locked && <span className="chip warn">Thiếu vốn</span>}
                                </div>
                                <small className="act-effect">{previewText(key, E.previewAction(key, state))}</small>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="step-locked">
                        <Lock size={16} />
                        <span>Hoàn thành các bước trong cửa sổ đang mở để mở khóa phần đầu tư.</span>
                      </div>
                    )}
                  </section>
                )}

                {state.finished && (
                  <>
                    <section id="sim-result" className="result-card">
                      <span className="eyebrow">KẾT QUẢ</span>
                      <h2>{result.label}</h2>
                      <p>{result.text}</p>
                      <div className="style-box">
                        <small>PHONG CÁCH ĐIỀU HÀNH</small>
                        <b>{style.label}</b>
                        <p>{style.text}</p>
                      </div>
                      <div className="score-grid">
                        <div className="tile"><small>Điểm tổng kết</small><b>{score}</b></div>
                        <div className="tile"><small>Kỷ lục</small><b>{Math.max(best, score)}</b></div>
                        <div className="tile"><small>Năng lực cạnh tranh</small><b>{state.competition}/100</b></div>
                        <div className="tile"><small>Vốn cuối</small><b>{state.capital} triệu</b></div>
                        <div className="tile"><small>Câu hỏi đúng</small><b>{state.quizCorrect}/{state.quizTotal}</b></div>
                        <div className="tile"><small>Danh hiệu</small><b>{state.badges.length}/{BADGES.length}</b></div>
                      </div>
                      {state.competition >= 100 && <p className="record"><Trophy size={16} /> Đạt tuyệt đối 100/100!</p>}
                      {newRecord && <p className="record"><Trophy size={16} /> Kỷ lục mới!</p>}
                      <p className="note-light">Điểm = năng lực cạnh tranh × 15 + vốn ÷ 8 + 30 mỗi câu đúng + 50 mỗi danh hiệu.</p>
                      <button className="primary" onClick={reset}><RotateCcw size={16} /> Chơi lại</button>
                    </section>

                    <section className="panel">
                      <div className="panel-title"><BarChart3 size={18} /> Diễn biến chỉ số qua các vòng</div>
                      <TrendChart trend={state.trend} mode="stats" />
                    </section>

                    <section className="panel">
                      <div className="panel-title"><CheckCircle2 size={18} /> Tổng kết kiến thức</div>
                      <div className="tabs-mini">
                        <button className={reviewTab === "quiz" ? "on" : ""} onClick={() => setReviewTab("quiz")}>Câu hỏi ({state.learned.length})</button>
                        <button className={reviewTab === "choice" ? "on" : ""} onClick={() => setReviewTab("choice")}>Tình huống ({state.choiceLog.length})</button>
                      </div>
                      <div className="review-list">
                        {reviewTab === "quiz" && state.learned.map((item, i) => (
                          <div className="review-item" key={i}>
                            <h4>{item.correct ? "✓" : "✗"} {item.q}</h4>
                            <p>{item.explain}</p>
                          </div>
                        ))}
                        {reviewTab === "choice" && state.choiceLog.map((c, i) => (
                          <div className="review-item alt" key={i}>
                            <h4>{c.title}: bạn chọn «{c.option}»</h4>
                            <p>{c.text} ({E.fxText(c.fx)}). {c.learn}</p>
                          </div>
                        ))}
                        {reviewTab === "choice" && state.choiceLog.length === 0 && <p className="empty">Ván này bạn chưa gặp tình huống bất ngờ nào.</p>}
                      </div>
                    </section>
                  </>
                )}
              </div>

              <aside className="sim-side">
                <div className="panel status">
                  <div className="status-top">
                    <div className="ring-wrap">
                      <Ring value={state.competition} />
                      <small>{predComp !== null ? `Dự kiến: ${predComp}` : "Năng lực cạnh tranh"}</small>
                    </div>
                    <div className="cap-block">
                      <span className="stat-ic"><Coins size={18} /></span>
                      <div>
                        <small>Vốn hiện tại</small>
                        <b>{state.capital} <i>triệu</i></b>
                        {pv ? (
                          <em className={pv.capital >= 0 ? "delta up" : "delta down"}>{pv.capital >= 0 ? "+" : "−"}{Math.abs(pv.capital)} triệu</em>
                        ) : (
                          state.last && <em className={state.last.profit >= 0 ? "delta up" : "delta down"}>Vòng trước {sign(state.last.profit)}{state.last.profit}</em>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="meters">
                    <Meter icon={Cpu} label="Công nghệ" value={state.technology} delta={pv ? pv.ok.technology : 0} />
                    <Meter icon={Users} label="Nhân lực" value={state.human} delta={pv ? pv.ok.human : 0} />
                    <Meter icon={Globe2} label="Thị trường" value={state.market} delta={pv ? pv.ok.market : 0} />
                  </div>
                  <p className="note">Cạnh tranh = 35% công nghệ + 30% nhân lực + 35% thị trường.</p>

                  <div className="side-detail">
                    {state.trend.length >= 2 && <TrendChart trend={state.trend} />}
                    <div className="tabs-mini">
                      <button className={sideTab === "badges" ? "on" : ""} onClick={() => setSideTab("badges")}>Danh hiệu {state.badges.length}/{BADGES.length}</button>
                      <button className={sideTab === "log" ? "on" : ""} onClick={() => setSideTab("log")}>Nhật ký</button>
                    </div>
                    {sideTab === "badges" ? (
                      <>
                        <div className="badge-list">
                          {BADGES.map((b) => {
                            const earned = state.badges.includes(b.id);
                            return (
                              <div key={b.id} className={earned ? "badge-row earned" : "badge-row"}>
                                <span className="badge-ico">{earned ? <Award size={16} /> : <Lock size={14} />}</span>
                                <div>
                                  <h5>{b.title}</h5>
                                  <p>{b.cond}</p>
                                  <small>{b.bonus}</small>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="note">Mỗi danh hiệu còn tăng 3% tỷ lệ thành công khi đầu tư.</p>
                      </>
                    ) : (
                      <div className="log-list">
                        {state.history.slice().reverse().map((x, i) => <p key={i}>{x}</p>)}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}

        {page === "theory" && (
          <>
            <section className="page-heading">
              <div>
                <span className="badge">LIÊN HỆ LÝ LUẬN</span>
                <h2>Lý luận và thực tiễn</h2>
                <p>Những khái niệm được chuyển thành cơ chế trong mô phỏng.</p>
              </div>
            </section>
            <div className="theory-grid">
              <Theory
                title="Tích lũy tư bản và tái sản xuất mở rộng"
                text="Tái sản xuất giản đơn lặp lại quy mô cũ vì toàn bộ giá trị thặng dư dùng cho tiêu dùng. Muốn mở rộng, phải chuyển hóa một phần giá trị thặng dư thành tư bản phụ thêm: mua thêm sức lao động, mở rộng nhà xưởng, mua nguyên vật liệu, máy móc. Nguồn gốc duy nhất của tư bản tích lũy là giá trị thặng dư."
              />
              <Theory
                title="Nhân tố ảnh hưởng quy mô tích lũy"
                text="Với khối lượng giá trị thặng dư nhất định, quy mô tích lũy phụ thuộc tỷ lệ chia giữa tích lũy và tiêu dùng. Bốn nhân tố chính: trình độ khai thác sức lao động, năng suất lao động xã hội, hiệu quả sử dụng máy móc (khấu hao) và đại lượng tư bản ứng trước. Trong game, vốn ban đầu, công nghệ và nhân lực tương ứng với các nhân tố này."
              />
              <Theory
                title="Tích tụ và tập trung tư bản"
                text="Tích tụ tư bản là tăng quy mô tư bản cá biệt nhờ biến giá trị thặng dư thành tư bản phụ thêm, làm tổng tư bản xã hội tăng. Tập trung tư bản là hợp nhất nhiều tư bản cá biệt thành tư bản lớn hơn, qua thôn tính hoặc sáp nhập, không làm tăng tổng tư bản. Cạnh tranh gay gắt thúc đẩy cả hai quá trình."
              />
              <Theory
                title="Cạnh tranh trong nền kinh tế thị trường"
                text="Cạnh tranh là sự ganh đua giữa các chủ thể kinh tế để có ưu thế về sản xuất và tiêu thụ. Trong nội bộ ngành, doanh nghiệp cải tiến kỹ thuật, đổi mới công nghệ, hợp lý hóa sản xuất, tăng năng suất để hạ giá trị cá biệt xuống thấp hơn giá trị xã hội. Điều kiện sản xuất khác nhau (trang bị kỹ thuật, tổ chức, tay nghề lao động) làm giá trị cá biệt khác nhau."
              />
              <Theory
                title="Hội nhập kinh tế quốc tế"
                text="Hội nhập là gắn kết nền kinh tế với thế giới dựa trên chia sẻ lợi ích và tuân thủ chuẩn mực quốc tế chung. Mặt tích cực: mở rộng thị trường, tiếp thu công nghệ, vốn, nâng chất lượng nhân lực. Mặt tiêu cực: cạnh tranh gay gắt hơn, nhiều doanh nghiệp khó khăn thậm chí phá sản, phụ thuộc thị trường bên ngoài."
              />
              <Theory
                title="Nâng cao năng lực cạnh tranh để hội nhập"
                text="Lợi ích hội nhập không tự đến với mọi doanh nghiệp. Để đứng vững, doanh nghiệp phải chú trọng đầu tư, cải tiến công nghệ, nâng chất lượng nhân lực, đồng thời mở rộng và đa dạng hóa thị trường, tránh phụ thuộc một thị trường hay một đối tác."
              />
              <Theory
                title="Bối cảnh: EVFTA và RCEP"
                text="EVFTA và RCEP là các hiệp định thương mại tự do mà Việt Nam tham gia: mở thêm thị trường nhưng đòi hỏi tiêu chuẩn cao hơn và làm cạnh tranh gay gắt hơn. Doanh nghiệp nông sản vùng sông Mekong là ví dụ điển hình cho cả cơ hội lẫn sức ép này."
              />
              <Theory
                title="Cơ chế trong mô phỏng"
                text="Mô phỏng có 10 vòng chia 3 giai đoạn; sang giai đoạn sau thiệt hại từ sự kiện bất lợi nặng hơn. Đầu tư có thể thất bại, hiệu quả giảm dần và mỗi lần chi vào cùng một hướng sẽ đắt hơn. Chỉ số bị bỏ bê xuống cấp nhẹ như máy móc hao mòn. Chuyển đổi toàn diện nâng cả ba chỉ số nhưng tốn vốn lớn, đắt dần và phải chờ 2 lượt mới dùng lại. Lợi nhuận phụ thuộc năng lực hiện có, sự kiện của vòng và các danh hiệu."
              />
            </div>
            <section className="formula">
              <span>TÍCH LŨY</span><b>→</b><span>TÁI ĐẦU TƯ</span><b>→</b><span>NĂNG SUẤT</span><b>→</b><span>CẠNH TRANH</span><b>→</b><span>HỘI NHẬP</span>
            </section>
          </>
        )}
      </main>

      {phase && (
        <FlowModal
          key={phase + state.round}
          phase={phase}
          state={state}
          onContinue={onContinue}
          onChoose={(i) => setState((s) => E.resolveChoice(s, i))}
          onAnswer={(i) => setState((s) => E.answerQuiz(s, i))}
        />
      )}
      {view && !phase && !guideOpen && (
        <FlowModal
          key={"view-" + view}
          phase={view === "event" ? "event" : view === "choice" ? "choice-result" : "quiz-result"}
          state={state}
          readonly
          onContinue={() => setView(null)}
        />
      )}
      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} onTheory={() => { setGuideOpen(false); setPage("theory"); window.scrollTo({ top: 0 }); }} />}

      <footer>SME Mekong · Sản phẩm sáng tạo Topic 4</footer>
    </div>
  );
}

function Theory({ title, text }) {
  return <article className="theory-card"><div className="theory-dot"></div><h3>{title}</h3><p>{text}</p></article>;
}

// Biểu đồ đường. mode "main": năng lực cạnh tranh và vốn. mode "stats": ba chỉ số năng lực.
function TrendChart({ trend, mode = "main" }) {
  const W = 300, H = 110, PAD = 8;
  const maxCap = Math.max(600, ...trend.map((t) => t.capital));
  const span = Math.max(3, trend[trend.length - 1].round);
  const x = (r) => PAD + (r / span) * (W - PAD * 2);
  const y100 = (v) => H - PAD - (v / 100) * (H - PAD * 2);
  const yCap = (v) => H - PAD - (Math.max(0, v) / maxCap) * (H - PAD * 2);
  const pts = (fn, key) => trend.filter((t) => t[key] !== undefined).map((t) => `${x(t.round)},${fn(t[key])}`).join(" ");
  return (
    <div className="trend">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diễn biến các chỉ số qua các vòng">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} className="trend-axis" />
        {mode === "main" ? (
          <>
            <polyline points={pts(yCap, "capital")} className="trend-cap" />
            <polyline points={pts(y100, "competition")} className="trend-comp" />
            {trend.map((t) => <circle key={t.round} cx={x(t.round)} cy={y100(t.competition)} r="2.6" className="trend-dot" />)}
          </>
        ) : (
          <>
            <polyline points={pts(y100, "technology")} className="trend-t" />
            <polyline points={pts(y100, "human")} className="trend-h" />
            <polyline points={pts(y100, "market")} className="trend-m" />
            <polyline points={pts(y100, "competition")} className="trend-comp thick" />
          </>
        )}
      </svg>
      <div className="trend-legend">
        {mode === "main" ? (
          <><span className="lg-comp">Cạnh tranh</span><span className="lg-cap">Vốn</span></>
        ) : (
          <><span className="lg-t">Công nghệ</span><span className="lg-h">Nhân lực</span><span className="lg-m">Thị trường</span><span className="lg-comp">Cạnh tranh</span></>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
