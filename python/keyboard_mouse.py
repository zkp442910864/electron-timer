from pynput import keyboard, mouse
import threading
import sys
import json

# 用于终止监听的全局标志
# stop_flag = False

# 监听鼠标事件
def listen_to_mouse():
    def send(key):
        try:
            event = {'event': 'mouse', 'key': str(key)}
            print(json.dumps(event))
            sys.stdout.flush()  # 确保数据发送到 Node.js
        except Exception as e:
            event = {'event': 'mouse', 'key': ''}
            print(json.dumps(event))
            sys.stderr.flush()

    def on_click(x, y, button, pressed):
        # if stop_flag:
        #     return False  # 停止鼠标监听
        # print(f'Mouse {button} {"pressed" if pressed else "released"} at ({x}, {y})')
        send('click')

    def on_move(x, y):
        send('move')

    def on_scroll(x, y, dx, dy):
        send('scroll')

    with mouse.Listener(on_click=on_click, on_move=on_move, on_scroll=on_scroll) as listener:
        listener.join()

# 监听键盘事件
def listen_to_keyboard():
    def send(key):
        try:
            event = {'event': 'key_press', 'key': str(key)}
            print(json.dumps(event))
            sys.stdout.flush()  # 确保数据发送到 Node.js
        except Exception as e:
            # print(f"Error: {e}", file=sys.stderr)
            event = {'event': 'key_press', 'key': ''}
            print(json.dumps(event))
            sys.stderr.flush()

    def on_key_press(key):
        # if stop_flag:
        #     return False  # 停止键盘监听
        # print(f'Key {key} pressed')
        send(key)

    def on_key_release(key):
        # global stop_flag
        # print(f'Key {key} released')
        # # 按下 Esc 键或 Ctrl + Q 组合键停止监听
        # if key == keyboard.Key.esc or (key == keyboard.Key.ctrl_l and hasattr(key, 'char') and key.char == 'q'):
        #     stop_flag = True
        #     return False  # 停止键盘监听
        send(key)


    with keyboard.Listener(on_press=on_key_press, on_release=on_key_release) as listener:
        listener.join()

# 启动线程
mouse_thread = threading.Thread(target=listen_to_mouse)
keyboard_thread = threading.Thread(target=listen_to_keyboard)

mouse_thread.start()
keyboard_thread.start()

# 等待线程结束
mouse_thread.join()
keyboard_thread.join()