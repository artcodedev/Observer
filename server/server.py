import errno
from flask import Flask
from flask import request
import os
import time

app = Flask(__name__)

def getCOMAND(file) -> str:
    fn_dir = '{}/users/{}/'.format(os.getcwd(), file)
    fn = '{}/users/{}/{}.txt'.format(os.getcwd(), file, file)
    file_dir_ex = os.path.exists(fn)
    txt = '{"type": "exe", "path": "","commands": []}'
    print(file_dir_ex)

    def writeFILE():
        f = open(fn, "w")
        f.write(txt)
        f.close()

    if file_dir_ex: 
        try:
            f = open(fn, "r")
            txt_s = f.read()
            print(txt_s)
            if len(txt_s) == 0:
                writeFILE()
            else: txt = txt_s
        except:
            print("Error read file: {}".format(fn))
    else:
        try:
            if os.path.exists(fn_dir):
                writeFILE()
                print("dir exiest")
            else:
                os.mkdir(os.path.dirname(fn_dir))
                print("dir not exist")
                writeFILE()
        except: print("Error create file: {}".format(fn))
    return txt


def writeRES_DATA(file, data):
    print("write res data")
    fn_dir = '{}/users_result/{}/'.format(os.getcwd(), file)
    fn = '{}/users_result/{}/{}.txt'.format(os.getcwd(), file, file)
    file_dir_ex = os.path.exists(fn)

    st = '{"ID": "' + file +'", "RESULT": "'+data+'"}'

    def writeFILE():
        f = open(fn, "w")
        f.write(st)
        f.close()
    
    if file_dir_ex:
        writeFILE()
    else:
        try:
            if os.path.exists(fn_dir):
                writeFILE()
            else:
                os.mkdir(os.path.dirname(fn_dir))
                writeFILE()
        except: print("Error create file: {}".format(fn))

@app.route('/')
def index():
    return 'It is index!'

@app.route('/info')
def info():
    return "info"

@app.route('/exe', methods=['GET'])
def exe():
    id = request.args.get('id')
    return getCOMAND(id)

@app.route('/dw', methods=['POST'])
def dw():
    id = request.form['ID']
    data = request.form['DATA']

    if len(id) != 0 and len(data) != 0:
        writeRES_DATA(id, data)
    return 'dw'

@app.route('/dw_file', methods=['POST'])
def dw_file():
    f = request.files['file']
    ns = f.filename.split("*")

    s = "./users_FILES/" + ns[0] + "_FILES"
    if os.path.exists(s) == False: os.makedirs(s)

    name_file = ns[1][len(ns[1]) - 10:].split(".")

    if len(name_file[1]) != 0:
        print("File save")
        f.save("{}/{}".format(s, str(int(time.time())) + "." + name_file[1]))
    print("dw_file")
    return "dw_files"


@app.route('/api/win') 
def get_data():
  return app.send_static_file('/static/{your_app}.zip')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")