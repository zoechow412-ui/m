# 免費瀏覽器 AI

更新：CPU／WASM 路徑及新坐姿素材已另見 [CPU-SEATED-QA.md](CPU-SEATED-QA.md)。以下保留先前 GPU 版本紀錄，唔代表最新限制。

2026-10-25。網站仍用原 Render Static Site；不建立 Oracle、Render Web Service 或付費模型API。

## 架構

用戶按「瀏覽器 AI（可選）」、閱讀限制並勾選同意後，才檢查WebGPU及載入本地vendor runtime。模型權重及WASM從Hugging Face／MLC下載；問題與命盤不發送到生成伺服器。候選模型Qwen2.5-1.5B-Instruct-q4f32_1-MLC，權重868,547,584 bytes，另有tokenizer、WASM與6.6MB執行程式。官方配置預估VRAM1888.97MB，實際裝置需要額外空間。

WebLLM0.2.85已存放於public/vendor；Apache-2.0 LICENSE隨附。runtime SHA256：341BAE95822BFEE1D0FD6A0E6CD2DB8613BB8EDF809390AC142FBA36EC17792C。模型／WASM為上游URL，不宣稱全部權重已作本地版本封存。

計算在既有排盤程式；AI只獲有限長度的盤面依據、目前問題與處境。system規則明示不得新增干支、星曜、用神、格局或應期。這是提示限制，不是數學保證；小模型仍可能答非所問或出錯。

## 行為

- 不同意不下載；載入中可返回命盤或取消。
- GPU檢查、載入及回答都有逾時；失敗不改用模板冒充AI。
- 只在完成解盤後自由追問；逐項術語及命盤按鈕保留規則式詳解。
- 回答純文字呈現，無模型HTML執行或工具權限。
- 模型沒有自動外部操作、付款、帳戶或檔案能力。
- 返回大廳會終止worker、取消待處理回答、清空AI對話記憶。權重快取可能保留，需由瀏覽器網站儲存設定刪除。
- 不持久保存AI對話；不可把免費功能誤稱不受頻寬或裝置限制。

## 檢查

`node tests/browser-model.mjs`：14項模擬生命週期測試，包括未實作用神／格局／應期由程式攔截、同意、無WebGPU、無adapter、載入、輸入限制、關閉、拒絕未就緒、取消期間不下載、版本不符、engine錯誤、逾時及跨諮詢舊回答隔離。

既有25項排盤測試、13項互動資料測試亦通過。模擬測試不代表實際生成品質。

真實瀏覽器已成功載入0.5B模型並完成生成，但三次品質測試仍答非所問，因此不採用0.5B；提示改為單一用戶訊息結合盤面參考與問題，另測1.5B。

1.5B已在真實瀏覽器完成權重載入及生成。測試要求「寫一句唔催促對方嘅回覆」，模型回應了一段有關溝通及理解對方需要的建議，但未嚴格完成一句草稿要求，且混入英文。技術路徑已通，嚴格指令遵從及輸出品質未達穩定服務標準。因此功能保持預設關閉、明示試驗，不聲稱專業命理師、完整命理解答或完整應期推算。用神／格局／應期問題不經模型猜算，由程式顯示未完成功能狀態，亦不將此固定狀態冒稱AI生成。

## 官方參考

- https://webllm.mlc.ai/docs/user/basic_usage.html
- https://webllm.mlc.ai/docs/user/advanced_usage.html
- https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f32_1-MLC
- https://github.com/mlc-ai/web-llm

完整用神、格局、應期並未因加入語言模型而自動完成。這些需要可測試的排盤規則與流派界定，不能交給小模型自行猜算。
