# 自架模型後端（尚未建立收費服務）

候選：官方 Qwen3-4B Q4_K_M（Apache-2.0），模型 2,497,280,256 bytes。固定模型 revision、SHA-256 及 llama.cpp commit，Docker build 時檢查權重摘要。

部署：Render 新增 Docker Web Service，Dockerfile path `selfhost/Dockerfile`，Docker context 為 repository root，健康路徑 `/healthz`。不得刪除或轉換原 Static Site。

規格建議：先測 8 GB RAM CPU 實例，單並發，8192 context；這是容量估算，不是已驗證吞吐量。2026-10-25 Render登入後新增服務頁顯示2 CPU／8 GB為US$135/月（未計可能額外費用）。須獲費用確認才建立服務。模型在 localhost:8081，不直接公開；Node gateway 只公開10000。`PUBLIC_ORIGIN` 必須設定新網站正式 HTTPS origin。

狀態分開：`/healthz` 只表示 gateway啟動，`/api/model-status` 才檢查模型載入。必須再送一段真實推論、量測延遲，才可說模型可用。

POST `/api/chat`：JSON `{method,topic,notes,question,history}`。限制原站Origin、JSON、body、上下文、頻率、並發及逾時。不記錄或儲存對話、出生資料；不呼叫外部生成API。history不接受system角色；模型沒有工具、憑證或伺服器執行權。

注意：瀏覽器傳來的命盤筆記未由伺服器重新計算，回答必須標示參考資料，不稱已核實。Prompt限制不能保證零幻覺；用神、格局及應期仍須由具測試案例的規則引擎提供，不由LLM猜算。

正式開放前還需：實際Docker建置、權重載入與推論、中文品質/幻覺測試、服務啟動記憶體與速度、負載與反濫用。gateway不信任任意轉發IP，當前計數按socket來源限流，平台共用代理可能共享限額；不能當成完整生產防濫用方案。

這份設定不是已上線模型。沒有把未測試的模型開關加到現有公眾頁面。

本地測試：`node tests/selfhost-gateway.mjs`。18項接駁／輸入檢查使用mock模型，不等於真實推論測試。當前電腦沒有Docker，因此Docker建置尚未驗證。

參考：
- https://huggingface.co/Qwen/Qwen3-4B-GGUF
- https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- https://render.com/docs/compute-plans
