from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os
from pathlib import Path

# 添加設備設定
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 標籤映射字典
label_mapping = {
    0: "平淡",
    1: "关切",
    2: "开心",
    3: "愤怒",
    4: "悲伤",
    5: "疑问",
    6: "惊讶",
    7: "厌恶"
}

def predict_emotion(text, model_path=None):
    """
    预测文本情感
    
    Args:
        text: 输入文本
        model_path: 模型路径，如果为None则使用默认路径
    
    Returns:
        预测的情感标签
    """
    if model_path is None:
        # 获取当前文件所在目录
        current_dir = Path(__file__).parent
        model_path = current_dir / "Chinese-Emotion-Small"
        model_path = str(model_path)
    
    print(f"🔍 使用模型路径: {model_path}")
    
    # 检查模型路径是否存在
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"模型路径不存在: {model_path}")
    
    try:
        # 載入模型和分詞器
        print(" 加载分词器...")
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        
        print(" 加载模型...")
        model = AutoModelForSequenceClassification.from_pretrained(
            model_path, 
            local_files_only=True
        ).to(device)
        
        print("✅ 模型加载成功")
        
        # 將文本轉換為模型輸入格式
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(device)
        
        # 進行預測
        with torch.no_grad():
            outputs = model(**inputs)
        
        # 取得預測結果
        predicted_class = torch.argmax(outputs.logits).item()
        predicted_emotion = label_mapping[predicted_class]
        
        return predicted_emotion
        
    except Exception as e:
        print(f"❌ 模型加载失败: {e}")
        raise e

if __name__ == "__main__":
    # 使用範例
    test_texts = [
        "雖然我努力了很久，但似乎總是做不到，我感到自己一無是處。",
        "你說的那些話真的讓我很困惑，完全不知道該怎麼反應。",
        "這世界真的是無情，為什麼每次都要給我這樣的考驗？",
        "有時候，我只希望能有一點安靜，不要再聽到這些無聊的話題。",
        "每次想起那段過去，我的心還是會痛，真的無法釋懷。",
        "我從來沒有想過會有這麼大的改變，現在我覺得自己完全失控了。",
        "我完全沒想到你會這麼做，這讓我驚訝到無法言喻。",
        "我知道我應該更堅強，但有些時候，這種情緒真的讓我快要崩潰了。"
    ]

    for text in test_texts:
        try:
            emotion = predict_emotion(text)
            print(f"文本: {text}")
            print(f"預測情緒: {emotion}\n")
        except Exception as e:
            print(f"❌ 预测失败: {e}\n")