# Backend 環境變數設定說明

## 本地開發 (.env 檔案)

1. **複製範本檔案**

   ```bash
   cp .env.example .env
   ```

2. **編輯 `.env` 檔案**，填入你的 Postgres 連線資訊：

   ```
   DATABASE_URL=postgres://postgres:xxxxxxxx@localhost:5432/postgres
   PORT=3000
   ```

3. **執行服務**
   ```bash
   npm install
   node create_table.js
   npm start
   ```

## Vercel 部署

1. **在 Vercel 專案設定中新增環境變數**

   - 進入 Vercel Dashboard → 你的專案 → Settings → Environment Variables
   - 新增變數：
     - Key: `DATABASE_URL`
     - Value: `postgres://user:password@your-db-host:5432/your-db`

2. **確保 `index.js` 中的 PORT 使用 `process.env.PORT`**
   - Vercel 會自動指派埠，預設為 3000（已在程式中設定）

## Render 部署

1. **在 Render 上建立 PostgreSQL 資料庫** (或使用外部 DB)

   - Render 會提供 `DATABASE_URL`，你可以直接複製

2. **在 Render 專案設定中新增環境變數**

   - 進入 Render Dashboard → 你的服務 → Environment
   - 新增 `DATABASE_URL` 環境變數

3. **設定啟動指令**
   ```
   npm install && node create_table.js && npm start
   ```

## 重要提醒

- **不要將 `.env` 檔案 commit 到 Git**（`.gitignore` 已設定）
- **在各個平台（Vercel、Render）分別設定環境變數**，不要依賴硬編碼
- **本機測試時使用 `.env` 檔案**，生產環境使用平台提供的環境變數管理界面

## 常見問題

**Q: 為何 `npm start` 時出現 "DATABASE_URL is not set"？**  
A: 確保你已經：

1. 複製 `.env.example` 為 `.env`
2. 在 `.env` 中填入有效的 `DATABASE_URL`
3. 或在命令列設定環境變數：

   ```powershell
   # PowerShell
   $env:DATABASE_URL = "postgres://..."; npm start

   # Bash
   export DATABASE_URL="postgres://..."; npm start
   ```
