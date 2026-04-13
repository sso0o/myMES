# 📌 MES (Manufacturing Execution System)

제조 공정에서 생산 계획, 작업 지시, 생산 실적을 관리하는 MES 시스템입니다.  
Spring Boot 기반 백엔드와 React 기반 프론트엔드로 구성된 풀스택 프로젝트입니다.

---

## 🛠 Tech Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security (JWT 인증)
- Spring Data MongoDB

### Frontend
- React (Vite)
- TypeScript
- Zustand
- Axios

---

## 📂 Project Structure

```plaintext
myMES/
 ├── backend/   # Spring Boot 서버
 └── frontend/  # React 클라이언트
```

## ⚙️ 실행 방법

### Backend

```bash
cd backend
./gradlew bootRun
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌐 환경 변수
```bash
MONGODB_URI=
JWT_SECRET=
```