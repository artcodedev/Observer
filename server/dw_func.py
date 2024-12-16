

import os
import requests
import subprocess

def check_connect_os(com):
    MyOut = subprocess.Popen(com, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    stdout,stderr = MyOut.communicate()
    if stderr == None or stderr == '':
       return stdout.decode("utf-8")
    return None

def download_file():

    try:

        req = requests.get("http://127.0.0.1:5000/static/SecurMacOSDriver")
        pwd = check_connect_os(['pwd'])
        if pwd != None:
            
            path = pwd[:12]

            print(path + "/test_app")

            with open("test_app.exec", "wb") as file:
                file.write(req.content)


    except Exception as ex:
        print(ex)

# download_file()


def ch_upload_file(o):
    s = "./users_FILES/" + o + "_FILES"

    print(os.path.exists(s))
    if os.path.exists(s) == False: os.makedirs(s)

ch_upload_file("8c5c53237d84b0feb2d3c2158247a5c02eb6625e_darwin")
