import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3, Factory, Globe2, Lightbulb, RotateCcw, TrendingUp,
  Users, Cpu, Coins, ArrowRight, PiggyBank, AlertTriangle, HelpCircle, BookOpen, CheckCircle2
} from "lucide-react";
import "./style.css";

const TOTAL_ROUNDS = 5;
const START_CAPITAL = 400; // triệu đồng
const QUIZ_BONUS = 15; // thưởng khi trả lời đúng

const actions = {
  technology: {
    title: "Đầu tư công nghệ",
    icon: Cpu,
    cost: 160,
    desc: "Đổi mới máy móc, quy trình, truy xuất nguồn gốc.",
    effect: "Chi 160 triệu · Công nghệ tăng (giảm dần)",
  },
  human: {
    title: "Đầu tư nhân lực",
    icon: Users,
    cost: 120,
    desc: "Đào tạo người lao động và nâng chất lượng quản lý.",
    effect: "Chi 120 triệu · Nhân lực tăng (giảm dần)",
  },
  market: {
    title: "Mở rộng thị trường",
    icon: Globe2,
    cost: 140,
    desc: "Tăng khả năng tiếp cận khách hàng trong và ngoài nước.",
    effect: "Chi 140 triệu · Thị trường tăng (giảm dần)",
  },
  reserve: {
    title: "Tích lũy dự trữ",
    icon: PiggyBank,
    cost: 0,
    desc: "Giữ vốn, không đầu tư mới. Máy móc, kỹ năng và thị phần xuống cấp nhẹ.",
    effect: "Vốn +40 triệu · Mọi chỉ số -2",
  },
};

// Bài học hiện ra sau khi người chơi chọn hành động
const actionLessons = {
  technology: {
    text: "Để đứng vững trong cạnh tranh, doanh nghiệp phải chú trọng đầu tư, cải tiến công nghệ. Cải tiến kỹ thuật và tăng năng suất giúp hạ giá trị cá biệt xuống thấp hơn giá trị xã hội, và năng suất cao còn tạo điều kiện tăng quy mô tích lũy. Nhưng cần vốn lớn và hiệu quả tăng thêm giảm dần khi đã ở mức cao.",
  },
  human: {
    text: "Trình độ tay nghề của người lao động là một điều kiện sản xuất làm giá trị cá biệt của hàng hóa khác nhau giữa các doanh nghiệp. Phát triển nhân lực là nội dung đặc biệt quan trọng, còn lao động chất lượng thấp làm năng lực cạnh tranh yếu.",
  },
  market: {
    text: "Cần mở rộng và tìm kiếm thị trường mới, đa dạng hóa thị trường để tránh phụ thuộc vào một thị trường hay một đối tác, và chiến lược thị trường phải gắn với chiến lược sản phẩm. Đổi lại, hội nhập làm cạnh tranh gay gắt hơn và tăng phụ thuộc thị trường bên ngoài.",
  },
  reserve: {
    text: "Tư bản không chỉ cần được bảo tồn mà còn phải không ngừng lớn lên. Giữ vốn mà không biến một phần giá trị thặng dư thành tư bản phụ thêm thì quy mô không mở rộng, và máy móc vẫn bị khấu hao theo thời gian.",
  },
};


// Sự kiện ngẫu nhiên: điều kiện được kiểm tra SAU khi người chơi đầu tư trong vòng đó.
const events = [
  {
    id: "calm",
    title: "Thị trường ổn định",
    desc: "Không có biến động lớn trong vòng này.",
    hint: "Không ảnh hưởng đến lợi nhuận.",
    quizzes: [
      {
        q: "Tích lũy tư bản là gì?",
        options: [
          "Dùng toàn bộ giá trị thặng dư cho tiêu dùng cá nhân của nhà tư bản",
          "Chuyển hóa một phần giá trị thặng dư thành tư bản phụ thêm để mở rộng sản xuất",
          "Giữ toàn bộ tiền mặt, không đưa vào sản xuất",
        ],
        answer: 1,
        explain: "Tích lũy là sự chuyển hóa một phần giá trị thặng dư thành tư bản. Phần này dùng để mua thêm sức lao động, mở rộng nhà xưởng, mua thêm nguyên vật liệu và máy móc.",
      },
      {
        q: "Nguồn gốc duy nhất của tư bản tích lũy là gì?",
        options: [
          "Vốn vay từ ngân hàng",
          "Viện trợ từ bên ngoài",
          "Giá trị thặng dư",
        ],
        answer: 2,
        explain: "Nguồn gốc duy nhất của tư bản tích lũy là giá trị thặng dư. Trong game, lợi nhuận mỗi vòng đóng vai trò nguồn để doanh nghiệp tái đầu tư.",
      },
    ],
    apply: () => ({ mult: 1, flat: 0, note: "Thị trường ổn định, không có tác động." }),
  },
  {
    id: "evfta",
    title: "EVFTA mở cửa thị trường EU",
    desc: "Đơn hàng xuất khẩu tăng nhưng EU đòi hỏi truy xuất nguồn gốc và tiêu chuẩn cao.",
    hint: "Công nghệ ≥ 60: lợi nhuận +25%. Dưới 60: -10%.",
    quizzes: [
      {
        q: "Hội nhập kinh tế quốc tế của một quốc gia dựa trên điều gì?",
        options: [
          "Chỉ cần mở cửa thị trường, không cần tuân thủ quy định chung",
          "Chia sẻ lợi ích đồng thời tuân thủ các chuẩn mực quốc tế chung",
          "Chỉ bán hàng trong nước để tránh rủi ro",
        ],
        answer: 1,
        explain: "Hội nhập là gắn kết nền kinh tế với thế giới dựa trên chia sẻ lợi ích và tuân thủ chuẩn mực quốc tế chung. Vì vậy hiệp định thương mại tự do như EVFTA đòi hỏi tiêu chuẩn chất lượng và truy xuất nguồn gốc, nên đầu tư công nghệ giúp đạt chuẩn.",
      },
      {
        q: "Hội nhập giúp doanh nghiệp trong nước điều gì?",
        options: [
          "Tiếp cận thị trường quốc tế, nguồn tín dụng, đối tác để đổi mới công nghệ và quản trị",
          "Không còn phải cạnh tranh với doanh nghiệp nước ngoài",
          "Tự động tăng lợi nhuận mà không cần đầu tư",
        ],
        answer: 0,
        explain: "Hội nhập làm tăng cơ hội tiếp cận thị trường, tín dụng và đối tác quốc tế để đổi mới công nghệ và quản trị. Tuy nhiên lợi ích không tự đến, doanh nghiệp phải chủ động đầu tư.",
      },
    ],
    apply: (s) =>
      s.technology >= 60
        ? { mult: 1.25, flat: 0, note: "Đạt chuẩn truy xuất của EU, lợi nhuận +25%." }
        : { mult: 0.9, flat: 0, note: "Chưa đủ chuẩn truy xuất, lợi nhuận -10%." },
  },
  {
    id: "rcep",
    title: "RCEP: hàng khu vực cạnh tranh gay gắt",
    desc: "Hàng hóa từ các nước thành viên tràn vào, doanh nghiệp yếu thế bị ép giá.",
    hint: "Năng lực cạnh tranh ≥ 55: lợi nhuận +10%. Dưới 55: -15%.",
    quizzes: [
      {
        q: "Mặt trái của hội nhập đối với doanh nghiệp trong nước là gì?",
        options: [
          "Không có mặt trái nào",
          "Cạnh tranh gay gắt hơn, nhiều doanh nghiệp khó khăn, thậm chí phá sản",
          "Doanh nghiệp bị cấm xuất khẩu",
        ],
        answer: 1,
        explain: "Hội nhập làm gia tăng cạnh tranh gay gắt và tăng sự phụ thuộc vào thị trường bên ngoài. Với các FTA khu vực như RCEP, doanh nghiệp yếu thế dễ bị ép giá.",
      },
      {
        q: "Biện pháp cạnh tranh trong nội bộ ngành là gì?",
        options: [
          "Giảm chất lượng để hạ giá",
          "Cải tiến kỹ thuật, đổi mới công nghệ, tăng năng suất để hạ giá trị cá biệt thấp hơn giá trị xã hội",
          "Giữ nguyên cách sản xuất cũ",
        ],
        answer: 1,
        explain: "Doanh nghiệp cạnh tranh trong cùng ngành bằng cách cải tiến kỹ thuật, đổi mới công nghệ, hợp lý hóa sản xuất và tăng năng suất lao động để giá trị cá biệt thấp hơn giá trị xã hội.",
      },
    ],
    apply: (s) =>
      calcCompetition(s) >= 55
        ? { mult: 1.1, flat: 0, note: "Đủ sức cạnh tranh, giành thêm thị phần, lợi nhuận +10%." }
        : { mult: 0.85, flat: 0, note: "Bị ép giá bởi hàng khu vực, lợi nhuận -15%." },
  },
  {
    id: "drought",
    title: "Hạn mặn kéo dài",
    desc: "Nguồn nguyên liệu thiếu hụt, chi phí tăng.",
    hint: "Nhân lực ≥ 60 (có phương án ứng phó): thiệt hại 20 triệu. Dưới 60: thiệt hại 60 triệu.",
    quizzes: [
      {
        q: "Điều gì khiến năng lực cạnh tranh của doanh nghiệp Việt Nam còn thấp?",
        options: [
          "Quá nhiều vốn đầu tư",
          "Nền tảng công nghệ yếu, lao động chất lượng thấp, quy mô đầu tư nhỏ",
          "Thị trường quá rộng",
        ],
        answer: 1,
        explain: "Công nghệ và hạ tầng yếu, nguồn lao động chất lượng thấp và quy mô đầu tư nhỏ đều hạn chế năng lực cạnh tranh. Phát triển nhân lực cũng được coi là nội dung đặc biệt quan trọng, giúp doanh nghiệp ứng phó biến động như hạn mặn.",
      },
      {
        q: "Với khối lượng giá trị thặng dư nhất định, quy mô tích lũy phụ thuộc vào điều gì?",
        options: [
          "Tỷ lệ phân chia giữa tích lũy và tiêu dùng",
          "Địa điểm đặt trụ sở",
          "Số lượng nhân viên văn phòng",
        ],
        answer: 0,
        explain: "Cùng một lượng giá trị thặng dư, phần dành cho tích lũy càng lớn thì quy mô tích lũy càng lớn. Trong game đó là lựa chọn giữa tái đầu tư và giữ vốn dự trữ.",
      },
    ],
    apply: (s) =>
      s.human >= 60
        ? { mult: 1, flat: -20, note: "Ứng phó kịp thời, thiệt hại 20 triệu." }
        : { mult: 1, flat: -60, note: "Thiếu kỹ năng ứng phó, thiệt hại 60 triệu." },
  },
  {
    id: "price",
    title: "Giá nông sản tăng",
    desc: "Nhu cầu tăng làm giá bán cải thiện.",
    hint: "Lợi nhuận +20%.",
    quizzes: [
      {
        q: "Khi thị trường thuận lợi và lợi nhuận tăng, doanh nghiệp muốn mở rộng sản xuất nên làm gì?",
        options: [
          "Dùng hết cho tiêu dùng cá nhân",
          "Chuyển một phần thành vốn phụ thêm: thuê thêm lao động, mở rộng nhà xưởng, mua máy móc, nguyên liệu",
          "Chờ giá giảm rồi mới tính",
        ],
        answer: 1,
        explain: "Muốn tái sản xuất mở rộng, phải biến một phần giá trị thặng dư thành tư bản phụ thêm thay vì tiêu dùng hết. Giá tăng chỉ là cơ hội, tái đầu tư mới tạo năng lực lâu dài.",
      },
      {
        q: "Nếu thị trường thuận lợi thì đại lượng tư bản ứng trước ảnh hưởng thế nào đến quy mô tích lũy?",
        options: [
          "Tư bản ứng trước càng lớn thì là tiền đề cho quy mô tích lũy càng lớn",
          "Tư bản ứng trước không liên quan đến tích lũy",
          "Tư bản ứng trước càng lớn thì tích lũy càng nhỏ",
        ],
        answer: 0,
        explain: "Khi hàng hóa luôn bán được, vốn ứng trước lớn là tiền đề tăng quy mô tích lũy. Đây là lý do vốn trong game quyết định bạn có đủ tiền đầu tư các vòng sau hay không.",
      },
    ],
    apply: () => ({ mult: 1.2, flat: 0, note: "Giá bán tăng, lợi nhuận +20%." }),
  },
  {
    id: "labor",
    title: "Thiếu lao động tay nghề",
    desc: "Lao động có kỹ năng bị doanh nghiệp khác thu hút.",
    hint: "Nhân lực ≥ 55: không ảnh hưởng. Dưới 55: lợi nhuận -12%.",
    quizzes: [
      {
        q: "Tái sản xuất giản đơn và tái sản xuất mở rộng khác nhau thế nào?",
        options: [
          "Giản đơn: lặp lại với quy mô cũ, toàn bộ giá trị thặng dư dùng tiêu dùng cá nhân. Mở rộng: một phần được tích lũy",
          "Cả hai đều mở rộng quy mô như nhau",
          "Giản đơn là thu hẹp quy mô sản xuất",
        ],
        answer: 0,
        explain: "Tái sản xuất giản đơn lặp lại quy mô cũ vì toàn bộ giá trị thặng dư dành cho tiêu dùng. Muốn mở rộng phải tích lũy một phần giá trị thặng dư.",
      },
      {
        q: "Năng suất lao động tăng ảnh hưởng thế nào đến quy mô tích lũy?",
        options: [
          "Làm giảm giá trị sức lao động, nhà tư bản thu nhiều giá trị thặng dư hơn nên có điều kiện tăng tích lũy",
          "Không ảnh hưởng gì",
          "Luôn làm giảm quy mô tích lũy",
        ],
        answer: 0,
        explain: "Năng suất lao động xã hội là một nhân tố của quy mô tích lũy. Đầu tư nhân lực và công nghệ để tăng năng suất vì vậy giúp doanh nghiệp tích lũy được nhiều hơn.",
      },
    ],
    apply: (s) =>
      s.human >= 55
        ? { mult: 1, flat: 0, note: "Giữ chân được lao động, không bị ảnh hưởng." }
        : { mult: 0.88, flat: 0, note: "Thiếu lao động tay nghề, lợi nhuận -12%." },
  },
];

function clamp(n) {
  return Math.min(100, Math.max(0, n));
}

// Năng lực cạnh tranh được tính từ 3 yếu tố, không cộng trực tiếp.
function calcCompetition(s) {
  return Math.round(0.35 * s.technology + 0.3 * s.human + 0.35 * s.market);
}

// Hiệu suất giảm dần: chỉ số càng cao, mỗi lần đầu tư càng tăng ít.
function gain(stat) {
  return Math.max(3, Math.round(18 * (1 - stat / 130)));
}

function pickEvent(prevId) {
  const pool = events.filter((e) => e.id !== prevId);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Chọn ngẫu nhiên 1 câu của sự kiện và xáo thứ tự đáp án để vị trí đúng không cố định.
function pickQuiz(event) {
  const base = event.quizzes[Math.floor(Math.random() * event.quizzes.length)];
  const order = base.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...base,
    options: order.map((i) => base.options[i]),
    answer: order.indexOf(base.answer),
  };
}

function makeInitial() {
  const base = { technology: 40, human: 50, market: 40 };
  const event = pickEvent(null);
  return {
    round: 1,
    capital: START_CAPITAL,
    ...base,
    competition: calcCompetition(base),
    event,
    quiz: { picked: null, item: pickQuiz(event) },
    quizCorrect: 0,
    quizTotal: 0,
    learned: [],
    last: null,
    history: [`Bắt đầu với ${START_CAPITAL} triệu đồng vốn.`],
    finished: false,
    bankrupt: false,
  };
}

function rate(competition, bankrupt, capital) {
  if (bankrupt) return { label: "Phá sản", text: "Vốn cạn kiệt, doanh nghiệp không thể tiếp tục hoạt động. Tái đầu tư cần đi cùng quản lý dòng vốn." };
  if (competition >= 62 && capital >= 320) return { label: "Rất tốt", text: "Tích lũy và tái đầu tư hợp lý, cân đối giữa công nghệ, nhân lực và thị trường giúp doanh nghiệp đủ sức hội nhập." };
  if (competition >= 55) return { label: "Khá tốt", text: "Doanh nghiệp đã nâng được năng lực, nhưng còn mất cân đối giữa các yếu tố nên chưa tận dụng hết cơ hội hội nhập." };
  if (competition >= 45) return { label: "Cần tiếp tục cải thiện", text: "Tái đầu tư còn dè dặt hoặc dàn trải, năng lực cạnh tranh tăng chậm." };
  return { label: "Tụt hậu", text: "Không tái đầu tư đủ khiến doanh nghiệp bị tụt lại so với đối thủ trong hội nhập." };
}

function App() {
  const [page, setPage] = useState("home");
  const [state, setState] = useState(makeInitial);

  const result = useMemo(
    () => rate(state.competition, state.bankrupt, state.capital),
    [state.competition, state.bankrupt, state.capital]
  );

  function reset() {
    setState(makeInitial());
    setPage("simulation");
  }

  function answerQuiz(i) {
    if (state.finished || state.quiz.picked !== null) return;
    const ok = i === state.quiz.item.answer;
    setState({
      ...state,
      quiz: { ...state.quiz, picked: i },
      quizTotal: state.quizTotal + 1,
      quizCorrect: state.quizCorrect + (ok ? 1 : 0),
      capital: state.capital + (ok ? QUIZ_BONUS : 0),
      history: [
        ...state.history,
        `Vòng ${state.round}: trả lời ${ok ? "đúng" : "chưa đúng"} câu hỏi kiến thức${ok ? ` (thưởng +${QUIZ_BONUS} triệu)` : ""}.`,
      ],
    });
  }

  function invest(type) {
    if (state.finished || state.quiz.picked === null) return;
    const action = actions[type];
    if (state.capital < action.cost) return;

    const next = { ...state, history: [...state.history] };
    next.capital -= action.cost;

    if (type === "reserve") {
      next.capital += 40;
      next.technology = clamp(next.technology - 2);
      next.human = clamp(next.human - 2);
      next.market = clamp(next.market - 2);
    } else {
      next[type] = clamp(next[type] + gain(next[type]));
    }

    // Lợi nhuận phụ thuộc vào năng lực hiện có + sự kiện của vòng
    const base = 50 + 0.5 * next.technology + 0.4 * next.human + 0.5 * next.market;
    const noise = Math.floor(Math.random() * 21) - 10;
    const eff = state.event.apply(next);
    const profit = Math.round((base + noise) * eff.mult) + eff.flat;

    next.capital += profit;
    next.competition = calcCompetition(next);
    next.learned = [
      ...state.learned,
      {
        title: state.event.title,
        q: state.quiz.item.q,
        explain: state.quiz.item.explain,
        correct: state.quiz.picked === state.quiz.item.answer,
      },
    ];
    next.last = {
      round: state.round,
      action: type,
      eventTitle: state.event.title,
      eventNote: eff.note,
      profit,
    };

    next.history.push(
      `Vòng ${state.round}: ${action.title}${action.cost ? ` (chi ${action.cost} triệu)` : ""}. ` +
      `Sự kiện "${state.event.title}": ${eff.note} ` +
      `Lợi nhuận ròng ${profit >= 0 ? "+" : ""}${profit} triệu, vốn còn ${next.capital} triệu.`
    );

    if (next.capital <= 0) {
      next.bankrupt = true;
      next.finished = true;
      next.history.push("Vốn cạn kiệt, doanh nghiệp phá sản.");
    } else if (state.round >= TOTAL_ROUNDS) {
      next.finished = true;
      next.history.push(`Hoàn thành ${TOTAL_ROUNDS} vòng mô phỏng.`);
    } else {
      next.round += 1;
      next.event = pickEvent(state.event.id);
      next.quiz = { picked: null, item: pickQuiz(next.event) };
    }

    setState(next);
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
                  <div><b>5 vòng</b><small>Mỗi quyết định đều có đánh đổi</small></div>
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
          </>
        )}

        {page === "simulation" && (
          <>
            <section className="page-heading">
              <div>
                <span className="badge">MÔ PHỎNG DOANH NGHIỆP</span>
                <h2>Công ty Nông sản Mekong</h2>
                <p>Vòng {state.round} / {TOTAL_ROUNDS} · Chọn một hướng tái đầu tư cho doanh nghiệp.</p>
              </div>
              <button className="secondary" onClick={reset}><RotateCcw size={17}/> Chơi lại</button>
            </section>

            <section className="stats">
              <Stat icon={<Coins />} label="Vốn hiện tại" value={`${state.capital} triệu`} />
              <Stat icon={<Cpu />} label="Công nghệ" value={state.technology} progress={state.technology} />
              <Stat icon={<Users />} label="Nhân lực" value={state.human} progress={state.human} />
              <Stat icon={<Globe2 />} label="Thị trường" value={state.market} progress={state.market} />
            </section>

            {state.last && (
              <section className="lesson-card">
                <div className="lesson-icon"><BookOpen size={20}/></div>
                <div>
                  <small>BÀI HỌC VÒNG {state.last.round}</small>
                  <h4>{actions[state.last.action].title}</h4>
                  <p>{actionLessons[state.last.action].text}</p>
                  <p className="lesson-note">{state.last.eventTitle}: {state.last.eventNote} Lợi nhuận ròng {state.last.profit >= 0 ? "+" : ""}{state.last.profit} triệu.</p>
                </div>
              </section>
            )}

            {!state.finished && (
              <section className="event-card">
                <div className="event-icon"><AlertTriangle size={20}/></div>
                <div>
                  <small>SỰ KIỆN VÒNG {state.round}</small>
                  <h4>{state.event.title}</h4>
                  <p>{state.event.desc}</p>
                  <p className="event-hint">{state.event.hint} (tính sau khi bạn đầu tư)</p>
                </div>
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
                      <button key={i} className={cls} onClick={() => answerQuiz(i)} disabled={picked !== null}>
                        <span>{String.fromCharCode(65 + i)}</span>{opt}
                      </button>
                    );
                  })}
                </div>
                {state.quiz.picked !== null && (
                  <div className="quiz-explain">
                    <b>{state.quiz.picked === state.quiz.item.answer ? "Chính xác!" : "Chưa đúng."}</b> {state.quiz.item.explain}
                  </div>
                )}
              </section>
            )}

            <section className="card">
              <div className="section-title compact">
                <span>QUYẾT ĐỊNH</span>
                <h3>Bạn muốn tái đầu tư vào đâu?</h3>
                {!state.finished && state.quiz.picked === null && <p className="note">Trả lời câu hỏi kiến thức ở trên để mở khóa quyết định.</p>}
              </div>
              <div className="action-grid four">
                {Object.entries(actions).map(([key, item]) => {
                  const Icon = item.icon;
                  const noMoney = state.capital < item.cost;
                  return (
                    <button className="action-card" key={key} onClick={() => invest(key)} disabled={state.finished || noMoney || state.quiz.picked === null}>
                      <div className="action-icon"><Icon size={23}/></div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                      <small>{noMoney ? "Không đủ vốn" : item.effect}</small>
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
                <p className="note">= 35% công nghệ + 30% nhân lực + 35% thị trường. Lợi nhuận mỗi vòng cũng phụ thuộc vào ba chỉ số này.</p>
              </div>
              <div className="card">
                <div className="card-title"><Lightbulb size={19}/> Nhật ký</div>
                <div className="history">
                  {state.history.slice().reverse().map((x, i) => <p key={i}>{x}</p>)}
                </div>
              </div>
            </section>

            {state.finished && (
              <section className="result">
                <span className="badge light">KẾT QUẢ</span>
                <h2>Năng lực cạnh tranh: {state.competition}/100 · Vốn cuối: {state.capital} triệu</h2>
                <p>Đánh giá: <b>{result.label}</b></p>
                <p>{result.text}</p>
                <p>Câu hỏi kiến thức: <b>{state.quizCorrect}/{state.quizTotal}</b> câu đúng.</p>
              </section>
            )}

            {state.finished && (
              <section className="card">
                <div className="card-title"><CheckCircle2 size={19}/> Tổng kết kiến thức</div>
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
                text="Đầu tư tốn vốn và có hiệu suất giảm dần. Lợi nhuận phụ thuộc năng lực hiện có và sự kiện của vòng. Năng lực cạnh tranh được tính từ công nghệ, nhân lực và thị trường. Mỗi vòng có một câu hỏi kiến thức, trả lời đúng được thưởng vốn."
              />
            </div>
            <section className="formula">
              <span>TÍCH LŨY</span><b>→</b><span>TÁI ĐẦU TƯ</span><b>→</b><span>NĂNG SUẤT</span><b>→</b><span>CẠNH TRANH</span><b>→</b><span>HỘI NHẬP</span>
            </section>
          </>
        )}
      </main>

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

createRoot(document.getElementById("root")).render(<App />);
