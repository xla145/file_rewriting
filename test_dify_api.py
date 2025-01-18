import requests
import json

class DifyAPITester:
    def __init__(self):
        self.api_url = 'https://api.dify.ai/v1/chat-messages'
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer app-1kTQuObQhQZzouim8MP5vZau',
        }

    def test_gen_title(self, content):
        """测试标题生成功能"""
        payload = {
            'inputs': {
                'gen_type': 1,
                'title': '',
            },
            'query': content,
            'response_mode': "streaming",
            'conversation_id': "",
            'user': "user"
        }

        print("\n=== 测试标题生成 ===")
        print("输入内容:", content[:100] + "..." if len(content) > 100 else content)
        
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                stream=True
            )

            print(response.text)
            
            content_array = []
            for line in response.iter_lines():
                if line:
                    try:
                        # 解码二进制数据为字符串
                        line_str = line.decode('utf-8')
                        # 移除"data: "前缀
                        if line_str.startswith('data: '):
                            line_str = line_str[6:]
                        data = json.loads(line_str)
                        if 'answer' in data:
                            print("收到响应:", data['answer'])
                            content_array.append(data['answer'])
                    except json.JSONDecodeError as e:
                        print(f"解析JSON失败: {e}")
                        continue
                    except UnicodeDecodeError as e:
                        print(f"解码失败: {e}")
                        continue
            
            content_str = "".join(content_array)
            titles = [item['title'] for item in json.loads(content_str)]
            print("生成的标题:", titles)
            return titles
            
        except Exception as e:
            print(f"请求失败: {e}")
            return []

    def test_gen_content(self, title, content):
        """测试文章内容生成功能"""
        payload = {
            'inputs': {
                'gen_type': 2,
                'title': title,
            },
            'query': content,
            'response_mode': "streaming",
            'conversation_id': "",
            'user': "user"
        }

        print("\n=== 测试内容生成 ===")
        print("输入标题:", title)
        
        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                stream=True
            )
            
            content = []
            for line in response.iter_lines():
                if line:
                    try:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            line_str = line_str[6:]
                        data = json.loads(line_str)
                        if 'answer' in data:
                            content.append(data['answer'])
                            print("收到响应片段:", data['answer'])
                    except json.JSONDecodeError as e:
                        print(f"解析JSON失败: {e}")
                        continue
            
            print("\n生成的完整内容:")
            print(''.join(content))
            return ''.join(content)
            
        except Exception as e:
            print(f"请求失败: {e}")
            return ""

def main():
    tester = DifyAPITester()
    
    # 测试用的示例文章内容
    test_content = """
    人工智能正在改变我们的生活方式。从智能手机助手到自动驾驶汽车，
    AI技术已经渗透到了我们日常生活的方方面面。机器学习算法能够从海量数据中学习模式，
    并做出智能决策。深度学习技术在图像识别、自然语言处理等领域取得了突破性进展。
    """
    
    # 测试生成标题
    titles = tester.test_gen_title(test_content)
    
    # 如果成功生成标题，测试生成文章内容
    if titles:
        for title in titles[:1]:  # 只测试第一个标题
            tester.test_gen_content(title, test_content)


def test():
    s = """[\n  {\"title\": \"人工智能如何重塑我们的日常生活？\"},\n  {\"title\": \"从智能手机到自动驾驶：AI技术的全面渗透\"},\n  {\"title\": \"机器学习与深度学习：AI技术的双引擎\"},\n  {\"title\": \"AI技术在日常生活中的十大应用场景\"},\n  {\"title\": \"人工智能：改变生活方式的革命性力量\"},\n  {\"title\": \"深度学习在图像识别和自然语言处理中的突破\"},\n  {\"title\": \"AI技术如何从海量数据中学习并做出智能决策？\"},\n  {\"title\": \"人工智能：未来生活的智能助手\"},\n  {\"title\": \"AI技术如何影响我们的日常生活？\"},\n  {\"title\": \"从数据到决策：AI技术的智能进化\"}\n]"""
    json_data = json.loads(s)
    for item in json_data:
        print(item['title'])

if __name__ == "__main__":
    main() 