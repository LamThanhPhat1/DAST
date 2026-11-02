# SME Mekong

Mô phỏng năng lực cạnh tranh của doanh nghiệp nhỏ và vừa vùng ĐBSCL: từ tích lũy, tái đầu tư đến hội nhập.

## Chạy thử

```bash
npm install
npm run dev
```

Build bản nộp: `npm run build` (kết quả trong `dist/`).

## Cách chơi

- 10 vòng chia 3 giai đoạn (Khởi động, Tăng tốc, Hội nhập sâu). Sang giai đoạn sau, thiệt hại từ sự kiện bất lợi nặng hơn.
- Mỗi vòng: đọc sự kiện, xử lý tình huống bất ngờ (nếu có), trả lời 1 câu hỏi kiến thức (đúng được +15 triệu và +10% tỷ lệ thành công), rồi chọn hướng đầu tư.
- Đầu tư có thể **thất bại** (vẫn mất vốn, chỉ nhận một phần nhỏ hiệu quả). Tỷ lệ thành công tăng theo câu trả lời đúng và số danh hiệu (+3% mỗi danh hiệu).
- Mỗi lần đầu tư vào cùng một hướng, **lần sau đắt hơn** (+15% chi phí gốc mỗi lần; chuyển đổi toàn diện +35%).
- **Chuyển đổi toàn diện**: nâng cả ba chỉ số cùng lúc, thành công 60% cơ bản, dùng xong phải chờ 2 lượt. Đây là cách duy nhất để chạm 100/100.
- Chỉ số không được đầu tư xuống cấp nhẹ mỗi vòng (hao mòn).
- Trang tự cuộn theo luồng chơi (sang vòng mới, sau khi trả lời câu hỏi hoặc xử lý tình huống, khi kết thúc) và có thông báo nhanh kết quả vòng trước.
- Lợi nhuận phụ thuộc công nghệ, nhân lực, thị trường, sự kiện và danh hiệu.
- Năng lực cạnh tranh = 35% công nghệ + 30% nhân lực + 35% thị trường.
- 5 danh hiệu mở khóa vĩnh viễn khi đạt ngưỡng chỉ số.
- Điểm tổng kết = cạnh tranh × 15 + vốn ÷ 8 + 30 mỗi câu đúng + 50 mỗi danh hiệu. Kỷ lục lưu trong trình duyệt.
- Xếp hạng: Hoàn hảo (100), Xuất sắc (≥ 90), Rất tốt (≥ 78 và vốn ≥ 300 triệu), Khá tốt (≥ 62), Cần cải thiện (≥ 50), Tụt hậu.

## Cấu trúc

- `src/engine.js`: luật chơi, sự kiện, 33 câu hỏi, 12 tình huống, danh hiệu (không phụ thuộc React).
- `src/main.jsx`: giao diện.
- Thêm câu hỏi: sửa `quizzes` của từng sự kiện trong mảng `events`.
- Thêm tình huống: thêm phần tử vào mảng `CHOICES` (mỗi phương án có `outcomes` với xác suất `p`, tổng bằng 1).
- Chỉnh độ khó: `ESCALATION`, `BASE_SUCCESS`, `FAIL_FACTOR`, `OVERHAUL_*`, `CHOICE_RATE`, `gain()`, `RATE` trong `src/engine.js`.

## Công nghệ

React 18, Vite 5, lucide-react.
