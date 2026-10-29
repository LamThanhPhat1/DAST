# SME Mekong - React

Web động mô phỏng doanh nghiệp nhỏ và vừa ở ĐBSCL.

## Chạy local

```bash
npm install
npm run dev
```

Sau đó mở địa chỉ Vite hiển thị, thường là http://localhost:5173

## Build

```bash
npm run build
```

## Deploy Vercel

Có thể đưa toàn bộ project lên GitHub rồi Import Repository vào Vercel.

Vercel:
- Framework: Vite
- Build command: npm run build
- Output directory: dist

Nếu Vercel tự nhận diện Vite thì chỉ cần giữ mặc định.

## Cơ chế mô phỏng (v1.1)

- 5 vòng, vốn ban đầu 400 triệu. Mỗi hành động tốn vốn khác nhau, hiệu suất giảm dần.
- Năng lực cạnh tranh = 35% công nghệ + 30% nhân lực + 35% thị trường.
- Lợi nhuận mỗi vòng phụ thuộc năng lực hiện có và một sự kiện ngẫu nhiên (EVFTA, RCEP, hạn mặn...).
- Có thể thua: không tái đầu tư thì tụt hậu, cạn vốn thì phá sản.
- "Rất tốt" cần cạnh tranh ≥ 62 và vốn cuối ≥ 320 triệu.

## Phần học (v1.2)

- Mỗi vòng có 1 câu hỏi kiến thức (12 câu, chọn ngẫu nhiên theo sự kiện); phải trả lời mới mở khóa quyết định. Đúng được thưởng 15 triệu.
- Sau mỗi quyết định hiện thẻ "Bài học" giải thích khái niệm liên quan.
- Cuối game có tổng kết kiến thức và số câu đúng.
- Thêm câu hỏi: sửa `quizzes` của từng sự kiện trong mảng `events` ở `src/main.jsx` (mỗi vòng chọn ngẫu nhiên 1 câu).

## Công nghệ

React + Vite + CSS + Lucide React.
Không cần backend/database cho bản demo này.
