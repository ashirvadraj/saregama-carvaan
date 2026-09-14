import ctypes
import time
import sys

ES_CONTINUOUS = 0x80000000
ES_SYSTEM_REQUIRED = 0x00000001
ES_DISPLAY_REQUIRED = 0x00000002
ES_AWAYMODE_REQUIRED = 0x00000040

FLAGS = ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED | ES_AWAYMODE_REQUIRED

print("Windows Keep-Awake Daemon active. Screen & System sleep prevented 24/7.")
sys.stdout.flush()

while True:
    try:
        ctypes.windll.kernel32.SetThreadExecutionState(FLAGS)
    except Exception as e:
        pass
    time.sleep(30)
