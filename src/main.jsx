import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3, Factory, Globe2, Lightbulb, RotateCcw, TrendingUp,
  Users, Cpu, Coins, ArrowRight, PiggyBank, AlertTriangle,
  HelpCircle, BookOpen, CheckCircle2, Award, Lock, Trophy, Sparkles, Shuffle
} from "lucide-react";
import "./style.css";
import * as E from "./engine.js";

const { TOTAL_ROUNDS, QUIZ_BONUS, STAGES, BADGES, actions, actionLessons } = E;

const actionIcons = { technology: Cpu, human: Users, market: Globe2, overhaul: Sparkles, reserve: PiggyBank };

const BEST_KEY = "sme-mekong-best";
function loadBest() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
}
function saveBest(v) {
  try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* bỏ qua */ }
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

function App() {
  const [page, setPage] = useState("home");
  const [state, setState] = useState(E.makeInitial);
  const [best, setBest] = useState(loadBest);
  const [newRecord, setNewRecord] = useState(false);
  const [toast, setToast] = useState(null);
  const prev = useRef({ page: "home", round: 1, finished: false, quizPicked: null, choicePicked: null });

  const result = E.rate(state);
  const score = E.calcScore(state);
  const stageIdx = E.stageOf(state.round);

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

  // Tự cuộn tới bước tiếp theo để người chơi không phải kéo thủ công.
  useEffect(() => {
    const p = prev.current;
    const now = {
      page,
      round: state.round,
      finished: state.finished,
      quizPicked: state.quiz.picked,
      choicePicked: state.choice ? state.choice.picked : null,
    };
    prev.current = now;
    if (page !== "simulation" || p.page !== "simulation") return;

    if (state.round < p.round || (p.finished && !state.finished)) {
      window.scrollTo({ top: 0, behavior: "auto" }); // chơi lại
    } else if (state.finished && !p.finished) {
      jumpTo("sim-result");
    } else if (state.round !== p.round) {
      jumpTo("sim-event"); // vòng mới: sự kiện, tình huống bất ngờ và câu hỏi nằm ngay bên dưới
    } else if (now.choicePicked !== null && p.choicePicked === null) {
      jumpTo("sim-choice-result");
    } else if (now.quizPicked !== null && p.quizPicked === null) {
      jumpTo("sim-quiz-explain");
    }
  }, [state, page]);

  // Thông báo nhanh kết quả của vòng vừa xong
  useEffect(() => {
    if (!state.last) return;
    if (state.finished) { setToast(null); return; }
    const l = state.last;
    const name = actions[l.action].title;
    const head =
      l.action === "reserve" ? `${name}.` : l.success ? `${name} thành công.` : `${name} thất bại, chỉ thu được một phần nhỏ.`;
    const text =
      `Vòng ${l.round}: ${head} Lợi nhuận ròng ${l.profit >= 0 ? "+" : ""}${l.profit} triệu.` +
      (l.newBadges.length ? ` Mở khóa danh hiệu: ${l.newBadges.join(", ")}.` : "");
    setToast({ text, ok: l.action === "reserve" || l.success });
    const t = setTimeout(() => setToast(null), 9000);
    return () => clearTimeout(t);
  }, [state.last]);

  function reset() {
    setState(E.makeInitial());
    setNewRecord(false);
    setToast(null);
    setPage("simulation");
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon"><Factory size={25} /></div>
          <div>
            <h1>SME Mekong</h1>
            <p>Mô phỏng năng lực cạnh tranh</p>
          </div>
        </div>

        <nav>
          <button className={page === "home" ? "nav active" : "nav"} onClick={() => setPage("home")}>Giới thiệu</button>
          <button className={page === "simulation" ? "nav active" : "nav"} onClick={() => setPage("simulation")}>Mô phỏng</button>
          <button className={page === "theory" ? "nav active" : "nav"} onClick={() => setPage("theory")}>Lý luận</button>
        </nav>
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
            <section className="page-heading">
              <div>
                <span className="badge">MÔ PHỎNG DOANH NGHIỆP</span>
                <h2>Công ty Nông sản Mekong</h2>
                <p>Vòng {state.finished ? TOTAL_ROUNDS : state.round} / {TOTAL_ROUNDS} · Chọn một hướng tái đầu tư cho doanh nghiệp.</p>
              </div>
              <button className="secondary" onClick={reset}><RotateCcw size={17}/> Chơi lại</button>
            </section>

            <section className="stage-banner">
              <div className="stage-dots">
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
                  const n = i + 1;
                  const cls = n < state.round || state.finished ? "dot done" : n === state.round ? "dot current" : "dot";
                  return <span key={n} className={cls}>{n}</span>;
                })}
              </div>
              <div className="stage-text">
                <small>GIAI ĐOẠN {stageIdx + 1}/3</small>
                <b>{STAGES[stageIdx].name}</b>
                <p>{STAGES[stageIdx].goal}</p>
              </div>
            </section>

            <section className="stats">
              <Stat icon={<Coins />} label="Vốn hiện tại" value={`${state.capital} triệu`} />
              <Stat icon={<Cpu />} label="Công nghệ" value={state.technology} progress={state.technology} />
              <Stat icon={<Users />} label="Nhân lực" value={state.human} progress={state.human} />
              <Stat icon={<Globe2 />} label="Thị trường" value={state.market} progress={state.market} />
            </section>

            {state.last && (
              <section id="sim-lesson" className={state.last.success ? "lesson-card" : "lesson-card fail"}>
                <div className="lesson-icon"><BookOpen size={20}/></div>
                <div>
                  <small>BÀI HỌC VÒNG {state.last.round}</small>
                  <h4>{actions[state.last.action].title}</h4>
                  {state.last.action !== "reserve" && (
                    <p className={state.last.success ? "result-ok" : "result-fail"}>
                      {state.last.success ? "Đầu tư thành công." : `Đầu tư thất bại. ${state.last.failNote}`} (xác suất thành công {Math.round(state.last.chance * 100)}%)
                    </p>
                  )}
                  <p>{actionLessons[state.last.action].text}</p>
                  <p className="lesson-note">{state.last.eventTitle}: {state.last.eventNote} Lợi nhuận ròng {state.last.profit >= 0 ? "+" : ""}{state.last.profit} triệu.</p>
                  {state.last.newBadges.length > 0 && (
                    <p className="lesson-badge"><Award size={15}/> Mở khóa danh hiệu: {state.last.newBadges.join(", ")}</p>
                  )}
                </div>
              </section>
            )}

            {!state.finished && (
              <section id="sim-event" className="event-card">
                <div className="event-icon"><AlertTriangle size={20}/></div>
                <div>
                  <small>SỰ KIỆN VÒNG {state.round}</small>
                  <h4>{state.event.title}</h4>
                  <p>{state.event.desc}</p>
                  <p className="event-hint">{state.event.hint} (tính sau khi bạn đầu tư)</p>
                </div>
              </section>
            )}

            {!state.finished && state.choice && (
              <section className="choice-card">
                <div className="card-title"><Shuffle size={19}/> Tình huống bất ngờ</div>
                <h4>{state.choice.item.title}</h4>
                <p className="choice-desc">{state.choice.item.desc}</p>
                <div className="choice-options">
                  {state.choice.item.options.map((opt, i) => {
                    const picked = state.choice.picked;
                    const need = E.choiceNeed(opt);
                    const noMoney = state.capital <= need;
                    let cls = "choice-option";
                    if (picked === i) cls += " chosen";
                    return (
                      <button key={i} className={cls} onClick={() => setState((s) => E.resolveChoice(s, i))} disabled={picked !== null || noMoney}>
                        <b>{opt.label}</b>
                        <small>{noMoney ? "Không đủ vốn" : opt.hint}</small>
                      </button>
                    );
                  })}
                </div>
                {state.choice.picked !== null && (
                  <div id="sim-choice-result" className="choice-result">
                    <b>{state.choice.result.text}</b> ({E.fxText(state.choice.result.fx)})
                    <span className="choice-learn">{state.choice.item.learn}</span>
                  </div>
                )}
              </section>
            )}

            {!state.finished && (
              <section className="quiz-card">
                <div className="card-title"><HelpCircle size={19}/> Câu hỏi kiến thức · đúng được +{QUIZ_BONUS} triệu</div>
                <h4>{state.quiz.item.q}</h4>
                <div className="quiz-options">
                  {state.quiz.item.options.map((opt, i) => {
                    const picked = state.quiz.picked;
                    let cls = "quiz-option";
                    if (picked !== null) {
                      if (i === state.quiz.item.answer) cls += " correct";
                      else if (i === picked) cls += " wrong";
                    }
                    return (
                      <button key={i} className={cls} onClick={() => setState((s) => E.answerQuiz(s, i))} disabled={picked !== null}>
                        <span>{String.fromCharCode(65 + i)}</span>{opt}
                      </button>
                    );
                  })}
                </div>
                {state.quiz.picked !== null && (
                  <div id="sim-quiz-explain" className="quiz-explain">
                    <b>{state.quiz.picked === state.quiz.item.answer ? "Chính xác!" : "Chưa đúng."}</b> {state.quiz.item.explain}
                  </div>
                )}
              </section>
            )}

            <section className="card">
              <div className="section-title compact">
                <span>QUYẾT ĐỊNH</span>
                <h3>Bạn muốn tái đầu tư vào đâu?</h3>
                {!state.finished && state.choice && state.choice.picked === null && <p className="note">Hãy xử lý tình huống bất ngờ ở trên trước khi quyết định.</p>}
                {!state.finished && state.quiz.picked === null && <p className="note">Trả lời câu hỏi kiến thức ở trên để mở khóa quyết định. Trả lời đúng còn tăng 10% tỷ lệ thành công của vòng này.</p>}
                <p className="note">Mẹo: mỗi lần đầu tư vào cùng một hướng, lần sau sẽ đắt hơn. "Chuyển đổi toàn diện" là con đường duy nhất để chạm 100/100 nhưng có rủi ro thất bại, đắt dần và phải chờ 2 lượt mới dùng lại được.</p>
              </div>
              <div className="action-grid five">
                {Object.entries(actions).map(([key, item]) => {
                  const Icon = actionIcons[key];
                  const cost = E.costOf(key, state);
                  const noMoney = state.capital < cost;
                  const locked = E.lockReason(key, state);
                  const chance = Math.round(E.successChance(key, state) * 100);
                  const waitingChoice = state.choice && state.choice.picked === null;
                  return (
                    <button className={key === "overhaul" ? "action-card special" : "action-card"} key={key} onClick={() => setState((s) => E.invest(s, key))} disabled={state.finished || noMoney || !!locked || state.quiz.picked === null || !!waitingChoice}>
                      <div className="action-icon">{locked ? <Lock size={23}/> : <Icon size={23}/>}</div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                      <small>{locked ? locked : noMoney ? `Cần ${cost} triệu, chưa đủ vốn` : cost ? `Chi ${cost} triệu · ${item.effect}` : item.effect}</small>
                      {key !== "reserve" && !locked && <em className="chance">Thành công {chance}%</em>}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="two-col">
              <div className="card">
                <div className="card-title"><BarChart3 size={19}/> Năng lực cạnh tranh</div>
                <div className="big-score">{state.competition}<span>/100</span></div>
                <div className="progress"><i style={{width: `${state.competition}%`}}></i></div>
                <TrendChart trend={state.trend} />
                <p className="note">= 35% công nghệ + 30% nhân lực + 35% thị trường. Lợi nhuận mỗi vòng cũng phụ thuộc vào ba chỉ số này.</p>
              </div>
              <div className="card">
                <div className="card-title"><Lightbulb size={19}/> Nhật ký</div>
                <div className="history">
                  {state.history.slice().reverse().map((x, i) => <p key={i}>{x}</p>)}
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-title"><Award size={19}/> Danh hiệu · {state.badges.length}/{BADGES.length}</div>
              <p className="note">Mỗi danh hiệu còn tăng 3% tỷ lệ thành công khi đầu tư.</p>
              <div className="badge-shelf">
                {BADGES.map((b) => {
                  const earned = state.badges.includes(b.id);
                  return (
                    <div key={b.id} className={earned ? "badge-item earned" : "badge-item"}>
                      <div className="badge-ico">{earned ? <Award size={18}/> : <Lock size={16}/>}</div>
                      <div>
                        <h4>{b.title}</h4>
                        <p>{b.cond}</p>
                        <small>{b.bonus}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {state.finished && (
              <section id="sim-result" className="result">
                <span className="badge light">KẾT QUẢ</span>
                <h2>{result.label}</h2>
                <p>{result.text}</p>
                <div className="score-row">
                  <div><small>Điểm tổng kết</small><b>{score}</b></div>
                  <div><small>Kỷ lục</small><b>{Math.max(best, score)}</b></div>
                  <div><small>Năng lực cạnh tranh</small><b>{state.competition}/100</b></div>
                  <div><small>Vốn cuối</small><b>{state.capital} triệu</b></div>
                  <div><small>Câu hỏi đúng</small><b>{state.quizCorrect}/{state.quizTotal}</b></div>
                  <div><small>Danh hiệu</small><b>{state.badges.length}/{BADGES.length}</b></div>
                </div>
                {state.competition >= 100 && <p className="record"><Trophy size={16}/> Đạt tuyệt đối 100/100!</p>}
                {newRecord && <p className="record"><Trophy size={16}/> Kỷ lục mới!</p>}
                <p className="note light">Điểm = năng lực cạnh tranh × 15 + vốn ÷ 8 + 30 mỗi câu đúng + 50 mỗi danh hiệu.</p>
                <button className="primary" onClick={reset}><RotateCcw size={17}/> Chơi lại</button>
              </section>
            )}

            {state.finished && (
              <section className="card">
                <div className="card-title"><CheckCircle2 size={19}/> Tổng kết kiến thức</div>
                {state.choiceLog.length > 0 && (
                  <div className="review choices">
                    {state.choiceLog.map((c, i) => (
                      <div className="review-item alt" key={i}>
                        <h4>{c.title}: bạn chọn "{c.option}"</h4>
                        <p>{c.text} ({E.fxText(c.fx)}). {c.learn}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="review">
                  {state.learned.map((item, i) => (
                    <div className="review-item" key={i}>
                      <h4>{item.correct ? "✓" : "✗"} {item.q}</h4>
                      <p>{item.explain}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
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

      {toast && page === "simulation" && (
        <div className={toast.ok ? "toast" : "toast fail"} role="status">
          <div className="toast-text">{toast.text}</div>
          <button onClick={() => { jumpTo("sim-lesson"); setToast(null); }}>Xem bài học</button>
          <button className="toast-x" aria-label="Đóng" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      <footer>SME Mekong · Sản phẩm sáng tạo Topic 4</footer>
    </div>
  );
}

function Stat({ icon, label, value, progress }) {
  return <div className="stat-card">
    <div className="stat-top"><span className="stat-icon">{icon}</span><small>{label}</small></div>
    <strong>{value}</strong>
    {progress !== undefined && <div className="progress"><i style={{width: `${progress}%`}}></i></div>}
  </div>;
}

function Theory({ title, text }) {
  return <article className="theory-card"><div className="theory-dot"></div><h3>{title}</h3><p>{text}</p></article>;
}

// Biểu đồ đường: năng lực cạnh tranh (xanh) và vốn (cam) qua từng vòng.
function TrendChart({ trend }) {
  const W = 300, H = 110, PAD = 8;
  const maxCap = Math.max(600, ...trend.map((t) => t.capital));
  const x = (r) => PAD + (r / TOTAL_ROUNDS) * (W - PAD * 2);
  const yComp = (v) => H - PAD - (v / 100) * (H - PAD * 2);
  const yCap = (v) => H - PAD - (Math.max(0, v) / maxCap) * (H - PAD * 2);
  const line = (fn, key) => trend.map((t) => `${x(t.round)},${fn(t[key])}`).join(" ");
  return (
    <div className="trend">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diễn biến năng lực cạnh tranh và vốn qua các vòng">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} className="trend-axis" />
        <polyline points={line(yCap, "capital")} className="trend-cap" />
        <polyline points={line(yComp, "competition")} className="trend-comp" />
        {trend.map((t) => <circle key={t.round} cx={x(t.round)} cy={yComp(t.competition)} r="2.6" className="trend-dot" />)}
      </svg>
      <div className="trend-legend"><span className="lg-comp">Cạnh tranh</span><span className="lg-cap">Vốn</span></div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
