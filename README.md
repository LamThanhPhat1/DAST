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
- Mỗi vòng có các cửa sổ lần lượt hiện lên: sự kiện thị trường, tình huống bất ngờ (nếu có). Sau đó chọn hướng đầu tư ở trang chính.
- **Mỗi lần chọn đầu tư sẽ hiện câu hỏi kiến thức: trả lời đúng thì đầu tư thành công, sai thì thất bại** (vẫn mất vốn, chỉ nhận một phần nhỏ hiệu quả). Công nghệ, nhân lực, thị trường: 1 câu. **Tích lũy dự trữ: không có câu hỏi.** **Chuyển đổi toàn diện: 3 câu liên tiếp** (mỗi hướng một câu), đúng ít nhất 2 câu là thành công.
- Câu hỏi ưu tiên đúng hướng đầu tư (công nghệ, nhân lực, thị trường), không lặp trong một ván khi còn câu mới. Có thể bấm "Quay lại" nếu chưa trả lời câu nào.
- Mỗi lần đầu tư vào cùng một hướng, **lần sau đắt hơn** (+15% chi phí gốc mỗi lần; chuyển đổi toàn diện +35%).
- **Chuyển đổi toàn diện**: nâng cả ba chỉ số cùng lúc, dùng xong phải chờ 2 lượt. Đây là cách duy nhất để chạm 100/100.
- Chỉ số không được đầu tư xuống cấp nhẹ mỗi vòng (hao mòn).
- Trang tự cuộn theo luồng chơi (sang vòng mới, sau khi trả lời câu hỏi hoặc xử lý tình huống, khi kết thúc). Kết quả vòng trước hiện ở thẻ thu gọn ngay phía trên lượt chơi, bấm "Bài học" để đọc.
- Lợi nhuận phụ thuộc công nghệ, nhân lực, thị trường, sự kiện và danh hiệu.
- Năng lực cạnh tranh = 35% công nghệ + 30% nhân lực + 35% thị trường.
- 5 danh hiệu mở khóa vĩnh viễn khi đạt ngưỡng chỉ số.
- Điểm tổng kết = cạnh tranh × 15 + vốn ÷ 8 + 30 mỗi câu đúng + 50 mỗi danh hiệu. Kỷ lục lưu trong trình duyệt.
- Xếp hạng: Hoàn hảo (100), Xuất sắc (≥ 90), Rất tốt (≥ 78 và vốn ≥ 300 triệu), Khá tốt (≥ 62), Cần cải thiện (≥ 50), Tụt hậu.

## Giao diện

- Sự kiện, tình huống bất ngờ và câu hỏi hiện dạng cửa sổ pop-up từng bước, có sẵn dải chỉ số hiện tại để cân nhắc. Trên điện thoại cửa sổ trượt từ dưới lên. Trang chính chỉ giữ các dòng tóm tắt (bấm "Xem lại" để mở lại) và phần đầu tư.
- Bố cục hai cột: bên trái là lượt chơi, bên phải là bảng tình hình doanh nghiệp (vốn, năng lực cạnh tranh, ba chỉ số, biểu đồ, danh hiệu, nhật ký). Trên điện thoại bảng này chuyển xuống dưới và có thanh chỉ số dính ở đầu.
- Rê chuột vào một thẻ đầu tư để xem trước tác động lên các chỉ số (thanh sọc, vốn, năng lực cạnh tranh dự kiến).
- "Cẩm nang" (luật chơi và cơ sở lý luận) mở dạng cửa sổ, tự mở lần đầu vào trang mô phỏng.
- Màn kết quả có phong cách điều hành và biểu đồ biến động chỉ số qua các vòng.
- Mỗi câu hỏi có nhãn chủ đề (Tích lũy tư bản, Lợi nhuận, Cạnh tranh, Hội nhập quốc tế, Vận dụng ĐBSCL...). Màn tổng kết gợi ý chủ đề nên ôn lại dựa trên các câu trả lời sai.
- Chủ đề: nút "Chủ đề" trên thanh đầu trang cho chọn Sáng, Tối hoặc Tự động theo hệ thống, và 3 màu chủ đạo (Mekong, Sông nước, Phù sa). Lựa chọn được lưu trong trình duyệt.

## Cấu trúc

- `src/engine.js`: luật chơi, sự kiện, 65 câu hỏi, 12 tình huống, danh hiệu (không phụ thuộc React).
- `src/main.jsx`: giao diện.
- Thêm câu hỏi: sửa `quizzes` của từng sự kiện trong mảng `events` (ngân hàng gồm 65 câu: 45 câu gắn với các sự kiện và 20 câu trong `MORE_QUIZZES`, tất cả được gom vào `QUIZ_BANK`; mỗi câu có thể có `fit` để ưu tiên đúng hướng đầu tư). Mỗi câu có `tag: TAGS.<chủ đề>` để hiện nhãn chủ đề và gợi ý ôn tập.
- Thêm tình huống: thêm phần tử vào mảng `CHOICES` (mỗi phương án có `outcomes` với xác suất `p`, tổng bằng 1).
- Chỉnh độ khó: `ESCALATION`, `BASE_SUCCESS`, `FAIL_FACTOR`, `OVERHAUL_*`, `CHOICE_RATE`, `gain()`, `RATE` trong `src/engine.js`.

## Công nghệ

React 18, Vite 5, lucide-react.
