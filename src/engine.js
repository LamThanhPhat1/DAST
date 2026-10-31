// Luật chơi và dữ liệu, không phụ thuộc React để dễ kiểm thử và cân bằng.

export const TOTAL_ROUNDS = 10;
export const START_CAPITAL = 400; // triệu đồng
export const QUIZ_BONUS = 15; // thưởng khi trả lời đúng

export const STAGES = [
  { name: "Khởi động", goal: "Đặt nền móng: nâng ba chỉ số năng lực và giữ vốn khỏe." },
  { name: "Tăng tốc", goal: "Quy mô lớn hơn, rủi ro cũng lớn hơn: sự kiện bất lợi nặng thêm 15%." },
  { name: "Hội nhập sâu", goal: "Cạnh tranh khốc liệt: sự kiện bất lợi nặng thêm 30%." },
];
const PENALTY_SCALE = [1, 1.15, 1.3];
export const stageOf = (round) => (round <= 3 ? 0 : round <= 7 ? 1 : 2);

// Chuyển đổi toàn diện
export const OVERHAUL_COST = 240;
export const OVERHAUL_COOLDOWN = 2; // số lượt phải chờ sau khi dùng
export const OVERHAUL_K = 30;
export const OVERHAUL_DIV = 125;

// Mỗi lần đầu tư vào cùng một hướng, lần sau tốn thêm bấy nhiêu phần trăm chi phí gốc.
export const ESCALATION = { technology: 0.15, human: 0.15, market: 0.15, overhaul: 0.35 };

// Rủi ro: xác suất thành công cơ bản, cộng thêm khi trả lời đúng câu hỏi và theo số danh hiệu.
export const BASE_SUCCESS = { technology: 0.75, human: 0.85, market: 0.7, overhaul: 0.6 };
export const QUIZ_SUCCESS_BONUS = 0.1;
export const BADGE_SUCCESS_BONUS = 0.03;
export const MAX_SUCCESS = 0.95;
// Khi thất bại, chỉ nhận được phần nhỏ hiệu quả
export const FAIL_FACTOR = { single: 0.3, overhaul: 0.35 };
export const FAIL_TEXT = {
  technology: "Công nghệ mới chưa phù hợp, vận hành trục trặc nên chỉ cải thiện được một phần nhỏ.",
  human: "Đào tạo chưa hiệu quả, một số nhân sự chưa theo kịp nên kết quả hạn chế.",
  market: "Chiến dịch mở rộng chưa tạo được nhiều đơn hàng như kỳ vọng.",
  overhaul: "Chuyển đổi dàn trải, gián đoạn sản xuất nên chỉ đạt một phần kết quả dự kiến.",
};

export const actions = {
  technology: {
    title: "Đầu tư công nghệ",
    cost: 160,
    desc: "Đổi mới máy móc, quy trình, truy xuất nguồn gốc.",
    effect: "Công nghệ tăng (giảm dần)",
  },
  human: {
    title: "Đầu tư nhân lực",
    cost: 120,
    desc: "Đào tạo người lao động và nâng chất lượng quản lý.",
    effect: "Nhân lực tăng (giảm dần)",
  },
  market: {
    title: "Mở rộng thị trường",
    cost: 140,
    desc: "Tăng khả năng tiếp cận khách hàng trong và ngoài nước.",
    effect: "Thị trường tăng (giảm dần)",
  },
  overhaul: {
    title: "Chuyển đổi toàn diện",
    cost: OVERHAUL_COST,
    desc: "Nâng đồng thời cả ba chỉ số. Dùng xong phải chờ 2 lượt và lần sau tốn thêm vốn.",
    effect: "Cả ba chỉ số cùng tăng mạnh",
  },
  reserve: {
    title: "Tích lũy dự trữ",
    cost: 0,
    desc: "Giữ vốn, không đầu tư mới. Máy móc, kỹ năng và thị phần xuống cấp nhẹ.",
    effect: "Vốn +40 triệu · Mọi chỉ số -2",
  },
};

// Chi phí tăng dần theo số lần đã đầu tư vào hướng đó.
export function costOf(type, state) {
  const uses = (state.uses && state.uses[type]) || 0;
  const esc = ESCALATION[type] || 0;
  return Math.round((actions[type].cost * (1 + esc * uses)) / 5) * 5;
}

export function successChance(type, state) {
  if (!(type in BASE_SUCCESS)) return 1;
  let p = BASE_SUCCESS[type] + state.badges.length * BADGE_SUCCESS_BONUS;
  if (state.quiz.picked !== null && state.quiz.picked === state.quiz.item.answer) p += QUIZ_SUCCESS_BONUS;
  return Math.min(MAX_SUCCESS, p);
}

export function lockReason(type, state) {
  if (type === "overhaul" && state.cooldown > 0) return `Đang hồi, còn ${state.cooldown} lượt`;
  return null;
}

export const BADGES = [
  { id: "export", title: "Chuẩn xuất khẩu", cond: "Công nghệ ≥ 65", bonus: "Lợi nhuận +6%", profit: 0.06, test: (s) => s.technology >= 65 },
  { id: "skill", title: "Đội ngũ tay nghề cao", cond: "Nhân lực ≥ 65", bonus: "Thiệt hại từ sự kiện bất lợi giảm một nửa", profit: 0, test: (s) => s.human >= 65 },
  { id: "market", title: "Thị trường đa dạng", cond: "Thị trường ≥ 65", bonus: "Lợi nhuận +6%", profit: 0.06, test: (s) => s.market >= 65 },
  { id: "balance", title: "Năng lực cân bằng", cond: "Cả ba chỉ số ≥ 55", bonus: "Lợi nhuận +5%", profit: 0.05, test: (s) => Math.min(s.technology, s.human, s.market) >= 55 },
  { id: "scholar", title: "Học giỏi hiểu sâu", cond: "Trả lời đúng ít nhất 6 câu hỏi", bonus: "Lợi nhuận +4%", profit: 0.04, test: (s) => s.quizCorrect >= 6 },
];

// Bài học hiện ra sau khi người chơi chọn hành động
export const actionLessons = {
  technology: {
    text: "Để đứng vững trong cạnh tranh, doanh nghiệp phải chú trọng đầu tư, cải tiến công nghệ. Cải tiến kỹ thuật và tăng năng suất giúp hạ giá trị cá biệt xuống thấp hơn giá trị xã hội, và năng suất cao còn tạo điều kiện tăng quy mô tích lũy. Nhưng cần vốn lớn và hiệu quả tăng thêm giảm dần khi đã ở mức cao.",
  },
  human: {
    text: "Trình độ tay nghề của người lao động là một điều kiện sản xuất làm giá trị cá biệt của hàng hóa khác nhau giữa các doanh nghiệp. Phát triển nhân lực là nội dung đặc biệt quan trọng, còn lao động chất lượng thấp làm năng lực cạnh tranh yếu.",
  },
  market: {
    text: "Cần mở rộng và tìm kiếm thị trường mới, đa dạng hóa thị trường để tránh phụ thuộc vào một thị trường hay một đối tác, và chiến lược thị trường phải gắn với chiến lược sản phẩm. Đổi lại, hội nhập làm cạnh tranh gay gắt hơn và tăng phụ thuộc thị trường bên ngoài.",
  },
  overhaul: {
    text: "Khi vốn tích lũy đã đủ lớn và các điều kiện đã vững, doanh nghiệp có thể tái sản xuất mở rộng ở quy mô lớn: đầu tư đồng bộ cho công nghệ, nhân lực và thị trường cùng lúc. Năng suất, chất lượng lao động và khả năng tiêu thụ cùng tăng sẽ tạo ra bước nhảy về năng lực cạnh tranh, nhưng đòi hỏi vốn ứng trước lớn.",
  },
  reserve: {
    text: "Tư bản không chỉ cần được bảo tồn mà còn phải không ngừng lớn lên. Giữ vốn mà không biến một phần giá trị thặng dư thành tư bản phụ thêm thì quy mô không mở rộng, và máy móc vẫn bị khấu hao theo thời gian.",
  },
};

export const events = [
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
      {
        q: "Tư bản bất biến (c) là bộ phận tư bản như thế nào?",
        options: [
          "Tồn tại dưới hình thức tư liệu sản xuất, giá trị được bảo tồn và chuyển dần vào sản phẩm",
          "Dùng để mua sức lao động và tự tăng giá trị trong sản xuất",
          "Là tiền mặt nhàn rỗi gửi trong ngân hàng",
        ],
        answer: 0,
        explain: "Máy móc, nhà xưởng, nguyên vật liệu là tư bản bất biến: giá trị chỉ được chuyển vào sản phẩm chứ không tự tăng thêm. Vốn chi cho công nghệ trong game thuộc nhóm này.",
      },
      {
        q: "Tư bản khả biến (v) dùng để làm gì và vì sao quan trọng?",
        options: [
          "Mua máy móc, giá trị tăng lên theo thời gian",
          "Mua sức lao động; lao động tạo ra giá trị mới lớn hơn giá trị sức lao động, tức giá trị thặng dư",
          "Trả thuế cho nhà nước",
        ],
        answer: 1,
        explain: "Chỉ lao động mới tạo ra giá trị mới, trong đó có phần giá trị thặng dư là nguồn của tích lũy. Vì vậy đầu tư nhân lực vừa là chi phí vừa là nguồn tăng năng suất.",
      }
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
      {
        q: "Hiệp định thương mại tự do (FTA) thường tạo ra lợi ích trực tiếp nào cho hàng xuất khẩu?",
        options: [
          "Tự động bảo đảm hàng luôn bán được",
          "Miễn mọi yêu cầu về chất lượng",
          "Cắt giảm thuế quan và mở rộng cơ hội tiếp cận thị trường",
        ],
        answer: 2,
        explain: "FTA giảm rào cản thuế quan nên hàng xuất khẩu cạnh tranh tốt hơn về giá, nhưng không thay thế yêu cầu về chất lượng và tiêu chuẩn. Doanh nghiệp vẫn phải tự nâng năng lực để tận dụng.",
      },
      {
        q: "Doanh nghiệp muốn giữ khách hàng lâu dài ở thị trường khó tính cần ưu tiên điều gì?",
        options: [
          "Chất lượng ổn định và uy tín giao hàng",
          "Thường xuyên thay đổi quy cách sản phẩm",
          "Bỏ bớt khâu kiểm tra chất lượng để giảm chi phí",
        ],
        answer: 0,
        explain: "Khách hàng ở thị trường có tiêu chuẩn cao chọn đối tác theo chất lượng ổn định và độ tin cậy. Đó là lý do công nghệ và quy trình luôn phải được duy trì.",
      }
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
      {
        q: "Cạnh tranh có tác động tích cực nào đối với nền kinh tế thị trường?",
        options: [
          "Làm mọi doanh nghiệp có lợi nhuận bằng nhau",
          "Thúc đẩy đổi mới, nâng năng suất và phát triển lực lượng sản xuất",
          "Loại bỏ nhu cầu đầu tư",
        ],
        answer: 1,
        explain: "Cạnh tranh buộc doanh nghiệp cải tiến kỹ thuật, nâng năng suất và chất lượng, nên thúc đẩy lực lượng sản xuất phát triển và phân bổ nguồn lực hiệu quả hơn.",
      },
      {
        q: "Mặt tiêu cực của cạnh tranh là gì?",
        options: [
          "Làm giá hàng hóa luôn tăng",
          "Làm doanh nghiệp không cần đổi mới",
          "Có thể dẫn tới cạnh tranh không lành mạnh, lãng phí nguồn lực hoặc tổn hại môi trường",
        ],
        answer: 2,
        explain: "Cạnh tranh có thể kéo theo thủ đoạn không lành mạnh, lãng phí hoặc tổn hại môi trường nếu thiếu quản lý. Vì vậy cần pháp luật và chuẩn mực chung khi hội nhập.",
      }
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
      {
        q: "Vì sao doanh nghiệp nên giữ một phần vốn dự phòng?",
        options: [
          "Vì tiền mặt luôn sinh lời cao hơn máy móc",
          "Để ứng phó biến động bất ngờ mà không làm gián đoạn sản xuất",
          "Để không bao giờ phải đầu tư",
        ],
        answer: 1,
        explain: "Thiên tai và giá cả biến động có thể xảy ra bất ngờ. Quỹ dự phòng giúp vượt qua giai đoạn khó mà không phải cắt giảm sản xuất, nhưng giữ quá nhiều thì mất cơ hội tái đầu tư.",
      }
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
      {
        q: "Giá cả thị trường lên xuống xoay quanh giá trị hàng hóa là biểu hiện của quy luật nào?",
        options: [
          "Quy luật lưu thông tiền tệ",
          "Quy luật độc quyền",
          "Quy luật giá trị",
        ],
        answer: 2,
        explain: "Giá cả là biểu hiện bằng tiền của giá trị và dao động xung quanh giá trị do tác động của cung cầu. Đó là biểu hiện của quy luật giá trị.",
      },
      {
        q: "Khi cung nhỏ hơn cầu, giá cả thị trường thường như thế nào?",
        options: [
          "Tăng lên",
          "Giảm xuống",
          "Luôn bằng giá trị",
        ],
        answer: 0,
        explain: "Cung nhỏ hơn cầu thì giá thường tăng trên giá trị, tạo lợi nhuận cao hơn. Đó là tín hiệu mở rộng sản xuất, nhưng cần xem đó là biến động ngắn hạn hay xu hướng bền vững.",
      }
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
      {
        q: "Tỷ suất giá trị thặng dư phản ánh điều gì?",
        options: [
          "Tỷ lệ giữa vốn vay và vốn tự có",
          "Tỷ lệ chiết khấu của máy móc",
          "Tỷ lệ giữa giá trị thặng dư và tư bản khả biến, phản ánh trình độ khai thác sức lao động",
        ],
        answer: 2,
        explain: "Tỷ suất giá trị thặng dư m' = m/v cho biết mức độ khai thác sức lao động. Cách bền vững để tăng nó là nâng năng suất nhờ kỹ năng và công nghệ, không phải ép giảm tiền công.",
      }
    ],
    apply: (s) =>
      s.human >= 55
        ? { mult: 1, flat: 0, note: "Giữ chân được lao động, không bị ảnh hưởng." }
        : { mult: 0.88, flat: 0, note: "Thiếu lao động tay nghề, lợi nhuận -12%." },
  },
  {
    id: "rival",
    title: "Đối thủ nâng cấp công nghệ",
    desc: "Một đối thủ cùng ngành vừa cải tiến dây chuyền, giá thành giảm rõ rệt.",
    hint: "Công nghệ ≥ 60: giữ vững thị phần, lợi nhuận +8%. Dưới 60: -12%.",
    quizzes: [
      {
        q: "Doanh nghiệp có giá trị cá biệt của hàng hóa thấp hơn giá trị xã hội sẽ ở vị thế nào?",
        options: [
          "Thu được lợi nhuận cao hơn mức bình thường",
          "Luôn bị thua lỗ",
          "Không có khác biệt gì so với đối thủ",
        ],
        answer: 0,
        explain: "Khi giá trị cá biệt thấp hơn giá trị xã hội, doanh nghiệp bán theo giá thị trường vẫn lãi hơn. Vì vậy các doanh nghiệp chạy đua cải tiến kỹ thuật, đổi mới công nghệ. Trong game, đối thủ vừa nâng công nghệ nên bạn cần theo kịp.",
      },
      {
        q: "Tích tụ tư bản là gì?",
        options: [
          "Hợp nhất nhiều doanh nghiệp thành một",
          "Tăng quy mô tư bản cá biệt bằng cách tư bản hóa giá trị thặng dư",
          "Bán bớt máy móc để giảm vốn",
        ],
        answer: 1,
        explain: "Tích tụ tư bản là sự tăng quy mô tư bản cá biệt nhờ biến giá trị thặng dư thành tư bản phụ thêm, nên nó là kết quả trực tiếp của tích lũy.",
      },
      {
        q: "Giá trị xã hội của hàng hóa do yếu tố nào quyết định?",
        options: [
          "Thời gian lao động xã hội cần thiết",
          "Chi phí riêng của từng doanh nghiệp",
          "Giá do doanh nghiệp lớn nhất tự đặt",
        ],
        answer: 0,
        explain: "Giá trị xã hội do thời gian lao động xã hội cần thiết quyết định. Doanh nghiệp sản xuất nhanh hơn mức trung bình có giá trị cá biệt thấp hơn và thu lợi nhiều hơn.",
      },
      {
        q: "Cạnh tranh giữa các ngành dẫn đến điều gì?",
        options: [
          "Mọi ngành đều ngừng sản xuất",
          "Vốn dịch chuyển từ ngành lãi thấp sang ngành lãi cao, hình thành tỷ suất lợi nhuận bình quân",
          "Giá hàng hóa cố định mãi mãi",
        ],
        answer: 1,
        explain: "Tư bản có xu hướng chảy vào ngành có lợi nhuận cao hơn. Quá trình này làm tỷ suất lợi nhuận giữa các ngành dần tiến tới mức bình quân.",
      }
    ],
    apply: (s) =>
      s.technology >= 60
        ? { mult: 1.08, flat: 0, note: "Công nghệ theo kịp đối thủ, giữ vững thị phần, lợi nhuận +8%." }
        : { mult: 0.88, flat: 0, note: "Công nghệ tụt lại sau đối thủ, mất khách, lợi nhuận -12%." },
  },
  {
    id: "supply",
    title: "Đối tác mời vào chuỗi cung ứng",
    desc: "Một nhà nhập khẩu lớn muốn thử hợp tác lâu dài nếu bạn đáp ứng yêu cầu của họ.",
    hint: "Công nghệ ≥ 55 và Nhân lực ≥ 55: lợi nhuận +18%. Ngược lại: không có đơn hàng.",
    quizzes: [
      {
        q: "Muốn tham gia sâu vào chuỗi giá trị khu vực và toàn cầu, doanh nghiệp cần gì?",
        options: [
          "Chỉ cần bán giá thật rẻ",
          "Đáp ứng yêu cầu về chất lượng, tiêu chuẩn và năng lực quản trị",
          "Chỉ bán cho một đối tác duy nhất",
        ],
        answer: 1,
        explain: "Đối tác lớn chọn nhà cung cấp theo chất lượng, tiêu chuẩn và độ tin cậy. Vì vậy cả công nghệ lẫn nhân lực cùng được đòi hỏi trong tình huống này.",
      },
      {
        q: "Vì sao doanh nghiệp nên đa dạng hóa thị trường và đối tác?",
        options: [
          "Để tránh phụ thuộc vào một thị trường hay một đối tác",
          "Để giảm chất lượng sản phẩm",
          "Để không phải đầu tư nữa",
        ],
        answer: 0,
        explain: "Hội nhập làm tăng sự phụ thuộc vào bên ngoài. Chỉ dựa vào một thị trường hay một đối tác sẽ rất rủi ro khi họ thay đổi chính sách hoặc nhu cầu.",
      },
      {
        q: "Rủi ro lớn khi doanh nghiệp nhỏ phụ thuộc vào một đối tác lớn trong chuỗi cung ứng là gì?",
        options: [
          "Không còn phải cạnh tranh",
          "Luôn được bảo đảm lợi nhuận cao",
          "Bị ép giá hoặc mất đơn hàng khi đối tác thay đổi chính sách",
        ],
        answer: 2,
        explain: "Phụ thuộc một đối tác làm doanh nghiệp yếu thế khi đàm phán và dễ tổn thương khi đơn hàng thay đổi. Vì vậy cần đa dạng hóa khách hàng và nâng năng lực riêng.",
      }
    ],
    apply: (s) =>
      s.technology >= 55 && s.human >= 55
        ? { mult: 1.18, flat: 0, note: "Đủ điều kiện vào chuỗi cung ứng, nhận đơn hàng lớn, lợi nhuận +18%." }
        : { mult: 1, flat: 0, note: "Chưa đủ chuẩn để nhận đơn hàng, bỏ lỡ cơ hội." },
  },
  {
    id: "merger",
    title: "Làn sóng sáp nhập trong ngành",
    desc: "Các doanh nghiệp lớn đang thâu tóm hoặc hợp nhất để mở rộng quy mô.",
    hint: "Cạnh tranh ≥ 60: nhận thêm khách hàng, lợi nhuận +15%. Dưới 55: mất thị phần, -12%. Ở giữa: không ảnh hưởng.",
    quizzes: [
      {
        q: "Tập trung tư bản là gì?",
        options: [
          "Dùng giá trị thặng dư để mở rộng nhà xưởng của chính mình",
          "Chia nhỏ doanh nghiệp để giảm rủi ro",
          "Hợp nhất nhiều tư bản cá biệt nhỏ thành một tư bản cá biệt lớn hơn",
        ],
        answer: 2,
        explain: "Tập trung tư bản diễn ra qua thôn tính hoặc hợp nhất, và cạnh tranh gay gắt thúc đẩy quá trình này. Doanh nghiệp yếu thế dễ bị thâu tóm, doanh nghiệp mạnh mở rộng quy mô.",
      },
      {
        q: "Điểm khác nhau chính giữa tích tụ và tập trung tư bản là gì?",
        options: [
          "Hai khái niệm hoàn toàn giống nhau",
          "Tích tụ là hợp nhất doanh nghiệp, tập trung là tích lũy",
          "Tích tụ làm tăng tổng tư bản xã hội, còn tập trung chỉ đổi cách phân bổ giữa các tư bản cá biệt",
        ],
        answer: 2,
        explain: "Tích tụ dựa vào tích lũy nên làm tổng tư bản xã hội tăng. Tập trung chỉ gộp các tư bản đã có thành quy mô lớn hơn, nhanh hơn nhưng không làm tăng tổng tư bản.",
      },
      {
        q: "Khi tích lũy tư bản diễn ra, cấu tạo hữu cơ của tư bản (c/v) có xu hướng thay đổi thế nào?",
        options: [
          "Giảm xuống",
          "Tăng lên",
          "Luôn không đổi",
        ],
        answer: 1,
        explain: "Tích lũy gắn với tiến bộ kỹ thuật làm tỷ trọng tư bản bất biến (máy móc, nguyên liệu) tăng nhanh hơn tư bản khả biến, nên c/v tăng. Doanh nghiệp đầu tư công nghệ cũng đi theo xu hướng này.",
      },
      {
        q: "Công ty cổ phần thúc đẩy tập trung tư bản bằng cách nào?",
        options: [
          "Chia nhỏ vốn thành nhiều doanh nghiệp độc lập",
          "Huy động vốn của nhiều người để hình thành tư bản lớn hơn",
          "Cấm mua bán cổ phiếu",
        ],
        answer: 1,
        explain: "Phát hành cổ phiếu huy động vốn nhàn rỗi từ nhiều nhà đầu tư, giúp hình thành tư bản cá biệt lớn nhanh hơn so với tự tích lũy.",
      }
    ],
    apply: (s) => {
      const c = calcCompetition(s);
      if (c >= 60) return { mult: 1.15, flat: 0, note: "Đủ sức cạnh tranh, nhận thêm khách hàng từ ngành, lợi nhuận +15%." };
      if (c < 55) return { mult: 0.88, flat: 0, note: "Yếu thế trong ngành, mất thị phần cho đối thủ lớn, lợi nhuận -12%." };
      return { mult: 1, flat: 0, note: "Giữ vững vị trí, không bị ảnh hưởng." };
    },
  },
];

export function clamp(n) {
  return Math.min(100, Math.max(0, n));
}

// Năng lực cạnh tranh được tính từ 3 yếu tố, không cộng trực tiếp.
export function calcCompetition(s) {
  return Math.round(0.35 * s.technology + 0.3 * s.human + 0.35 * s.market);
}

// Hiệu suất giảm dần: chỉ số càng cao, mỗi lần đầu tư càng tăng ít.
export function gain(stat) {
  return Math.max(3, Math.round(18 * (1 - stat / 130)));
}

// Chuyển đổi toàn diện: mỗi chỉ số tăng ít nhất 5, giảm dần khi tiến gần 100.
export function overhaulGain(stat) {
  return Math.max(5, Math.round(OVERHAUL_K * (1 - stat / OVERHAUL_DIV)));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Rút sự kiện từ "bộ bài" đã xáo: không lặp sự kiện cho đến khi dùng hết.
function drawEvent(deck, lastId) {
  const d = deck.length ? deck : shuffle(events.filter((e) => e.id !== lastId).map((e) => e.id));
  const [id, ...rest] = d;
  return { event: events.find((e) => e.id === id), deck: rest };
}

function drawChoice(deck) {
  const d = deck.length ? deck : shuffle(CHOICES.map((c) => c.id));
  const [id, ...rest] = d;
  return { item: CHOICES.find((c) => c.id === id), deck: rest };
}

// Ưu tiên câu chưa gặp; xáo thứ tự đáp án để vị trí đúng không cố định.
function pickQuiz(event, used) {
  const fresh = event.quizzes.filter((q) => !used.includes(q.q));
  const pool = fresh.length ? fresh : event.quizzes;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const order = shuffle(base.options.map((_, i) => i));
  return {
    ...base,
    options: order.map((i) => base.options[i]),
    answer: order.indexOf(base.answer),
  };
}

export function makeInitial() {
  const base = { technology: 40, human: 50, market: 40 };
  const { event, deck } = drawEvent([], null);
  const competition = calcCompetition(base);
  return {
    round: 1,
    capital: START_CAPITAL,
    ...base,
    competition,
    event,
    deck,
    quiz: { picked: null, item: pickQuiz(event, []) },
    choice: null,
    choiceDeck: [],
    choiceLog: [],
    uses: { technology: 0, human: 0, market: 0, overhaul: 0 },
    cooldown: 0,
    quizCorrect: 0,
    quizTotal: 0,
    usedQuiz: [],
    learned: [],
    badges: [],
    trend: [{ round: 0, competition, capital: START_CAPITAL }],
    last: null,
    history: [`Bắt đầu với ${START_CAPITAL} triệu đồng vốn.`],
    finished: false,
    bankrupt: false,
  };
}

export function answerQuiz(state, i) {
  if (state.finished || state.quiz.picked !== null) return state;
  const ok = i === state.quiz.item.answer;
  return {
    ...state,
    quiz: { ...state.quiz, picked: i },
    quizTotal: state.quizTotal + 1,
    quizCorrect: state.quizCorrect + (ok ? 1 : 0),
    usedQuiz: [...state.usedQuiz, state.quiz.item.q],
    capital: state.capital + (ok ? QUIZ_BONUS : 0),
    history: [
      ...state.history,
      `Vòng ${state.round}: trả lời ${ok ? "đúng" : "chưa đúng"} câu hỏi kiến thức${ok ? ` (thưởng +${QUIZ_BONUS} triệu)` : ""}.`,
    ],
  };
}

const STAT_NAMES = { capital: "Vốn", technology: "Công nghệ", human: "Nhân lực", market: "Thị trường" };
export function fxText(fx) {
  const parts = Object.entries(fx)
    .filter(([, v]) => v)
    .map(([k, v]) => `${STAT_NAMES[k]} ${v > 0 ? "+" : ""}${v}${k === "capital" ? " triệu" : ""}`);
  return parts.length ? parts.join(", ") : "không thay đổi";
}

// Người chơi chọn một phương án trong tình huống bất ngờ.
export function resolveChoice(state, i) {
  if (!state.choice || state.choice.picked !== null || state.finished) return state;
  const opt = state.choice.item.options[i];
  if (!opt || state.capital <= choiceNeed(opt)) return state;

  let r = Math.random();
  let out = opt.outcomes[opt.outcomes.length - 1];
  for (const o of opt.outcomes) {
    if (r < o.p) { out = o; break; }
    r -= o.p;
  }

  const next = { ...state, history: [...state.history] };
  const f = out.fx;
  next.capital += f.capital || 0;
  ["technology", "human", "market"].forEach((k) => {
    if (f[k]) next[k] = clamp(next[k] + f[k]);
  });
  next.competition = calcCompetition(next);
  next.choice = { ...state.choice, picked: i, result: { text: out.text, fx: f } };
  next.choiceLog = [
    ...state.choiceLog,
    { title: state.choice.item.title, learn: state.choice.item.learn, option: opt.label, text: out.text, fx: f },
  ];
  next.history.push(`Vòng ${state.round}: tình huống "${state.choice.item.title}", chọn "${opt.label}". ${out.text} (${fxText(f)}).`);
  return next;
}

export function invest(state, type) {
  if (state.finished || state.quiz.picked === null) return state;
  if (state.choice && state.choice.picked === null) return state;
  const cost = costOf(type, state);
  if (state.capital < cost) return state;
  if (lockReason(type, state)) return state;

  const next = { ...state, history: [...state.history], badges: [...state.badges] };
  next.capital -= cost;

  const keys = ["technology", "human", "market"];
  const chance = successChance(type, state);
  const success = type === "reserve" ? true : Math.random() < chance;

  if (type === "reserve") {
    next.capital += 40;
    keys.forEach((k) => (next[k] = clamp(next[k] - 2)));
  } else if (type === "overhaul") {
    keys.forEach((k) => {
      const g = overhaulGain(next[k]);
      next[k] = clamp(next[k] + (success ? g : Math.max(1, Math.round(g * FAIL_FACTOR.overhaul))));
    });
  } else {
    // Chỉ số được đầu tư tăng, các chỉ số bị bỏ bê xuống cấp nhẹ (hao mòn)
    keys.forEach((k) => {
      if (k === type) {
        const g = gain(next[k]);
        next[k] = clamp(next[k] + (success ? g : Math.max(1, Math.round(g * FAIL_FACTOR.single))));
      } else {
        next[k] = clamp(next[k] - 1);
      }
    });
  }
  if (type !== "reserve") next.uses = { ...state.uses, [type]: (state.uses[type] || 0) + 1 };
  next.cooldown = type === "overhaul" ? OVERHAUL_COOLDOWN : Math.max(0, state.cooldown - 1);

  // Danh hiệu mở khóa vĩnh viễn
  const newBadges = [];
  BADGES.forEach((b) => {
    if (!next.badges.includes(b.id) && b.test(next)) {
      next.badges.push(b.id);
      newBadges.push(b.title);
    }
  });
  const has = (id) => next.badges.includes(id);
  const bonus = BADGES.filter((b) => has(b.id)).reduce((sum, b) => sum + b.profit, 0);

  // Lợi nhuận phụ thuộc năng lực hiện có, sự kiện và danh hiệu
  const base = 50 + 0.5 * next.technology + 0.4 * next.human + 0.5 * next.market;
  const noise = Math.floor(Math.random() * 21) - 10;
  const eff = state.event.apply(next);
  const penalty = PENALTY_SCALE[stageOf(state.round)] * (has("skill") ? 0.5 : 1);
  let note = eff.note;
  let mult = eff.mult;
  let flat = eff.flat;
  if (mult < 1) mult = 1 - (1 - mult) * penalty;
  if (flat < 0) flat = Math.round(flat * penalty);
  if ((eff.mult < 1 || eff.flat < 0) && has("skill")) note += " Đội ngũ tay nghề giúp giảm nhẹ thiệt hại.";
  const profit = Math.round((base + noise) * mult * (1 + bonus)) + flat;

  next.capital += profit;
  next.competition = calcCompetition(next);
  next.trend = [...state.trend, { round: state.round, competition: next.competition, capital: next.capital }];
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
    success,
    chance,
    failNote: success ? null : FAIL_TEXT[type],
    eventTitle: state.event.title,
    eventNote: note,
    profit,
    newBadges,
  };
  next.history.push(
    `Vòng ${state.round}: ${actions[type].title}${cost ? ` (chi ${cost} triệu)` : ""}` +
      `${type === "reserve" ? "" : success ? ", thành công." : ", thất bại."} ` +
      `Sự kiện "${state.event.title}": ${note} ` +
      `Lợi nhuận ròng ${profit >= 0 ? "+" : ""}${profit} triệu, vốn còn ${next.capital} triệu.` +
      (newBadges.length ? ` Mở khóa danh hiệu: ${newBadges.join(", ")}.` : "")
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
    const drawn = drawEvent(state.deck, state.event.id);
    next.event = drawn.event;
    next.deck = drawn.deck;
    next.quiz = { picked: null, item: pickQuiz(next.event, next.usedQuiz) };
    next.choice = null;
    next.choiceDeck = state.choiceDeck;
    if (Math.random() < CHOICE_RATE) {
      const c = drawChoice(state.choiceDeck);
      next.choice = { item: c.item, picked: null, result: null };
      next.choiceDeck = c.deck;
    }
  }
  return next;
}

export function calcScore(s) {
  const raw = s.competition * 15 + Math.round(s.capital / 8) + s.quizCorrect * 30 + s.badges.length * 50;
  return s.bankrupt ? Math.round(raw / 2) : Math.max(0, raw);
}

export const CHOICE_RATE = 0.45; // xác suất một vòng (từ vòng 2) có tình huống cần chọn

export const CHOICES = [
  {
    id: "rush",
    title: "Đơn hàng gấp",
    desc: "Một đối tác nhờ giao gấp một lô hàng lớn trong tuần này.",
    learn: "Tăng cường độ lao động có thể tăng lợi nhuận ngắn hạn nhưng bào mòn nhân lực. Tăng năng suất bền vững mới là hướng lâu dài.",
    options: [
      { label: "Nhận hết, tăng ca", hint: "Vốn +70 triệu, Nhân lực -4", outcomes: [{ p: 1, text: "Giao đúng hạn nhưng nhân viên kiệt sức.", fx: { capital: 70, human: -4 } }] },
      { label: "Nhận một phần", hint: "Vốn +30 triệu", outcomes: [{ p: 1, text: "Giao đủ phần nhận, đội ngũ vẫn khỏe.", fx: { capital: 30 } }] },
      { label: "Từ chối", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn giữ nhịp sản xuất bình thường.", fx: {} }] },
    ],
  },
  {
    id: "fair",
    title: "Hội chợ thương mại quốc tế",
    desc: "Ban tổ chức mời bạn tham gia hội chợ, nơi có nhiều nhà nhập khẩu.",
    learn: "Mở rộng thị trường cần chi phí và có rủi ro. Tiếp cận nhiều khách hàng giúp doanh nghiệp bớt phụ thuộc vào một thị trường.",
    options: [
      { label: "Thuê gian hàng lớn", hint: "Chi 60 triệu. 60%: Thị trường +9. 40%: Thị trường +2", outcomes: [
        { p: 0.6, text: "Gian hàng thu hút nhiều khách quốc tế.", fx: { capital: -60, market: 9 } },
        { p: 0.4, text: "Ít khách ghé thăm, chỉ có vài liên hệ.", fx: { capital: -60, market: 2 } } ] },
      { label: "Gửi mẫu sản phẩm", hint: "Chi 15 triệu, Thị trường +3", outcomes: [{ p: 1, text: "Mẫu hàng tạo được vài khách quan tâm.", fx: { capital: -15, market: 3 } }] },
      { label: "Bỏ qua", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn không tham gia.", fx: {} }] },
    ],
  },
  {
    id: "machine",
    title: "Mời mua máy móc đời mới",
    desc: "Một nhà cung cấp chào bán dây chuyền mới, hứa hẹn tăng năng suất.",
    learn: "Máy móc là tư bản cố định, chuyển dần giá trị vào sản phẩm qua khấu hao. Máy mới giúp tăng năng suất nhưng rủi ro nếu không phù hợp với quy trình.",
    options: [
      { label: "Mua ngay", hint: "Chi 90 triệu. 70%: Công nghệ +10. 30%: Công nghệ +2", outcomes: [
        { p: 0.7, text: "Dây chuyền mới chạy ổn, năng suất tăng rõ.", fx: { capital: -90, technology: 10 } },
        { p: 0.3, text: "Máy không tương thích với quy trình hiện có.", fx: { capital: -90, technology: 2 } } ] },
      { label: "Thuê thử", hint: "Chi 25 triệu, Công nghệ +3", outcomes: [{ p: 1, text: "Dùng thử vài tuần, học được cách vận hành.", fx: { capital: -25, technology: 3 } }] },
      { label: "Giữ máy cũ", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn tiếp tục dùng máy cũ.", fx: {} }] },
    ],
  },
  {
    id: "staff",
    title: "Nhân viên giỏi xin nghỉ",
    desc: "Một kỹ thuật viên giỏi nhận được lời mời từ công ty khác.",
    learn: "Chất lượng nhân lực là nhân tố của năng suất lao động. Giữ chân người giỏi là đầu tư vào năng lực dài hạn.",
    options: [
      { label: "Tăng lương giữ chân", hint: "Chi 40 triệu, Nhân lực +5", outcomes: [{ p: 1, text: "Người giỏi ở lại và truyền nghề cho đồng nghiệp.", fx: { capital: -40, human: 5 } }] },
      { label: "Đồng ý cho nghỉ", hint: "Nhân lực -5", outcomes: [{ p: 1, text: "Mất đi người có tay nghề cao.", fx: { human: -5 } }] },
      { label: "Tuyển người mới", hint: "Chi 25 triệu. 50%: Nhân lực +1. 50%: Nhân lực -2", outcomes: [
        { p: 0.5, text: "Người mới nhanh chóng thích nghi.", fx: { capital: -25, human: 1 } },
        { p: 0.5, text: "Người mới cần nhiều thời gian làm quen.", fx: { capital: -25, human: -2 } } ] },
    ],
  },
  {
    id: "fund",
    title: "Quỹ hỗ trợ doanh nghiệp nhỏ",
    desc: "Một chương trình hỗ trợ vốn đang nhận hồ sơ, số suất có hạn.",
    learn: "Chính sách hỗ trợ giúp doanh nghiệp nhỏ có thêm vốn ứng trước, nhưng cần chuẩn bị hồ sơ và đáp ứng điều kiện.",
    options: [
      { label: "Nộp hồ sơ", hint: "Chi 10 triệu. 50%: nhận 100 triệu. 50%: không được duyệt", outcomes: [
        { p: 0.5, text: "Hồ sơ được duyệt, nhận khoản hỗ trợ.", fx: { capital: 90 } },
        { p: 0.5, text: "Hồ sơ không được duyệt.", fx: { capital: -10 } } ] },
      { label: "Không tham gia", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn bỏ qua chương trình.", fx: {} }] },
    ],
  },
  {
    id: "trader",
    title: "Thương lái ép giá",
    desc: "Thương lái quen đề nghị mua với giá thấp hơn thị trường.",
    learn: "Hội nhập làm doanh nghiệp phụ thuộc thị trường bên ngoài. Đa dạng kênh tiêu thụ giúp tránh bị ép giá.",
    options: [
      { label: "Chấp nhận giá thấp", hint: "Vốn -30 triệu", outcomes: [{ p: 1, text: "Bán hết hàng nhưng lợi nhuận mỏng.", fx: { capital: -30 } }] },
      { label: "Tìm khách mới", hint: "50%: Thị trường +5. 50%: mất đơn, Vốn -50", outcomes: [
        { p: 0.5, text: "Tìm được khách mới với giá tốt hơn.", fx: { market: 5 } },
        { p: 0.5, text: "Không kịp tìm khách, hàng tồn kho.", fx: { capital: -50 } } ] },
      { label: "Bán thêm qua kênh trực tuyến", hint: "Chi 20 triệu, Thị trường +2", outcomes: [{ p: 1, text: "Kênh trực tuyến mở thêm một nhóm khách.", fx: { capital: -20, market: 2 } }] },
    ],
  },
  {
    id: "cert",
    title: "Khách yêu cầu chứng nhận chất lượng",
    desc: "Một khách hàng lớn muốn sản phẩm có chứng nhận trước khi đặt hàng dài hạn.",
    learn: "Tuân thủ chuẩn mực quốc tế là điều kiện của hội nhập. Đầu tư để đạt chuẩn mở ra cơ hội dài hạn.",
    options: [
      { label: "Làm chứng nhận", hint: "Chi 60 triệu, Công nghệ +4, Thị trường +3", outcomes: [{ p: 1, text: "Đạt chứng nhận, quy trình chuẩn hóa hơn.", fx: { capital: -60, technology: 4, market: 3 } }] },
      { label: "Hoãn lại", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn để dịp này qua đi.", fx: {} }] },
    ],
  },
  {
    id: "coop",
    title: "Hợp tác xã mời liên kết",
    desc: "Hợp tác xã địa phương mời bạn tham gia chuỗi liên kết sản xuất và tiêu thụ.",
    learn: "Liên kết giúp doanh nghiệp nhỏ tập hợp nguồn lực, chia sẻ rủi ro và tiếp cận thị trường chung.",
    options: [
      { label: "Gia nhập", hint: "Chi 20 triệu, Thị trường +3, Nhân lực +2", outcomes: [{ p: 1, text: "Có thêm đầu ra và được chia sẻ kinh nghiệm.", fx: { capital: -20, market: 3, human: 2 } }] },
      { label: "Tự đi một mình", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn giữ cách làm riêng.", fx: {} }] },
    ],
  },
  {
    id: "harvest",
    title: "Mùa vụ bội thu, nguyên liệu rẻ",
    desc: "Nguyên liệu đang rẻ bất thường. Bạn có thể mua dự trữ để chờ giá lên.",
    learn: "Dự trữ nguyên liệu là một dạng tư bản lưu động. Mua dự trữ có thể sinh lời nhưng chịu rủi ro biến động giá.",
    options: [
      { label: "Mua dự trữ nhiều", hint: "Cần 70 triệu. 60%: lời 70 triệu. 40%: lỗ 20 triệu", need: 70, outcomes: [
        { p: 0.6, text: "Giá nguyên liệu tăng, bạn bán lại có lãi.", fx: { capital: 70 } },
        { p: 0.4, text: "Giá tiếp tục giảm, bạn chịu lỗ.", fx: { capital: -20 } } ] },
      { label: "Mua vừa phải", hint: "Cần 30 triệu. 80%: lời 25 triệu. 20%: lỗ 10 triệu", need: 30, outcomes: [
        { p: 0.8, text: "Giá nhích lên, bạn có lãi nhỏ.", fx: { capital: 25 } },
        { p: 0.2, text: "Giá giảm nhẹ, bạn lỗ một ít.", fx: { capital: -10 } } ] },
      { label: "Không mua", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn đứng ngoài cuộc.", fx: {} }] },
    ],
  },
  {
    id: "training",
    title: "Chương trình tập huấn miễn phí",
    desc: "Một chương trình hỗ trợ tập huấn kỹ thuật cho doanh nghiệp nhỏ đang mở đăng ký.",
    learn: "Đào tạo nâng trình độ tay nghề làm tăng năng suất lao động, nhưng tạm thời làm mất thời gian sản xuất.",
    options: [
      { label: "Cử toàn bộ nhân viên", hint: "Vốn -25 triệu (nghỉ sản xuất), Nhân lực +6", outcomes: [{ p: 1, text: "Cả đội nâng được tay nghề.", fx: { capital: -25, human: 6 } }] },
      { label: "Cử một nhóm", hint: "Nhân lực +3", outcomes: [{ p: 1, text: "Nhóm tham gia về chia sẻ lại cho đồng nghiệp.", fx: { human: 3 } }] },
      { label: "Bỏ qua", hint: "Không thay đổi", outcomes: [{ p: 1, text: "Bạn không tham gia.", fx: {} }] },
    ],
  },
  {
    id: "breakdown",
    title: "Máy móc có dấu hiệu hỏng",
    desc: "Máy chính phát ra tiếng lạ, kỹ thuật viên khuyên nên kiểm tra.",
    learn: "Máy móc bị hao mòn dần (khấu hao). Bảo trì đúng lúc thường rẻ hơn sửa chữa lớn sau sự cố.",
    options: [
      { label: "Bảo trì ngay", hint: "Chi 40 triệu", outcomes: [{ p: 1, text: "Máy được bảo dưỡng, vận hành ổn định.", fx: { capital: -40 } }] },
      { label: "Chạy tiếp", hint: "50%: không sao. 50%: hỏng nặng, Vốn -90, Công nghệ -5", need: 90, outcomes: [
        { p: 0.5, text: "May mắn, máy chạy tiếp bình thường.", fx: {} },
        { p: 0.5, text: "Máy hỏng nặng giữa mùa sản xuất.", fx: { capital: -90, technology: -5 } } ] },
    ],
  },
  {
    id: "rumor",
    title: "Tin đồn thất thiệt về sản phẩm",
    desc: "Mạng xã hội lan truyền thông tin sai về chất lượng sản phẩm của bạn.",
    learn: "Uy tín và thương hiệu là một phần của năng lực cạnh tranh. Minh bạch giúp bảo vệ thị phần.",
    options: [
      { label: "Công bố minh bạch quy trình", hint: "Chi 30 triệu. 70%: Thị trường +2. 30%: không đổi", outcomes: [
        { p: 0.7, text: "Khách hàng tin tưởng hơn vì sự minh bạch.", fx: { capital: -30, market: 2 } },
        { p: 0.3, text: "Thông tin chưa lan đủ rộng.", fx: { capital: -30 } } ] },
      { label: "Im lặng", hint: "50%: tin đồn tự lắng. 50%: Thị trường -6", outcomes: [
        { p: 0.5, text: "Tin đồn nhanh chóng lắng xuống.", fx: {} },
        { p: 0.5, text: "Khách hàng nghi ngại, đơn hàng giảm.", fx: { market: -6 } } ] },
    ],
  },
];

export function choiceNeed(opt) {
  if (opt.need !== undefined) return opt.need;
  return Math.max(0, ...opt.outcomes.map((o) => -(o.fx.capital || 0)));
}

export function rate(s) {
  const { competition, bankrupt, capital } = s;
  if (bankrupt) return { label: "Phá sản", text: "Vốn cạn kiệt, doanh nghiệp không thể tiếp tục hoạt động. Tái đầu tư cần đi cùng quản lý dòng vốn." };
  if (competition >= 100) return { label: "Hoàn hảo", text: "Công nghệ, nhân lực và thị trường đều đạt mức tối đa. Tích lũy đúng lúc và tái đầu tư toàn diện đã đưa doanh nghiệp lên đỉnh năng lực cạnh tranh." };
  if (competition >= RATE.excellent) return { label: "Xuất sắc", text: "Doanh nghiệp biết tích lũy, xây nền tảng rồi chuyển đổi toàn diện đúng thời điểm. Năng lực cạnh tranh vượt trội, sẵn sàng cho hội nhập sâu." };
  if (competition >= RATE.top.c && capital >= RATE.top.cap) return { label: "Rất tốt", text: "Tích lũy và tái đầu tư hợp lý, cân đối giữa công nghệ, nhân lực và thị trường giúp doanh nghiệp đủ sức hội nhập." };
  if (competition >= RATE.good) return { label: "Khá tốt", text: "Doanh nghiệp đã nâng được năng lực, nhưng còn mất cân đối giữa các yếu tố hoặc vốn chưa dồi dào nên chưa tận dụng hết cơ hội hội nhập." };
  if (competition >= RATE.ok) return { label: "Cần tiếp tục cải thiện", text: "Tái đầu tư còn dè dặt hoặc dàn trải, năng lực cạnh tranh tăng chậm." };
  return { label: "Tụt hậu", text: "Không tái đầu tư đủ khiến doanh nghiệp bị tụt lại so với đối thủ trong hội nhập." };
}
export const RATE = { excellent: 90, top: { c: 78, cap: 300 }, good: 62, ok: 50 };
