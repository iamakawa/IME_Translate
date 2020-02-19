const plist_format_pre =
    '<?xml version = "1.0" encoding = "UTF-8" ?>' + '\n' +
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' + "\n" +
    '<plist version="1.0">' + "\n" +
    '<array>' + "\n";
const plist_format_pos =
    "</array>" + "\n" +
    "</plist>";

const INPUT_FORM_POS = 0;
const OUTPUT_FORM_POS = 5;
var reg = /(.*)(?:\.([^.]+$))/;

// 場所の設定
var element = document.getElementsByName("translate_select");
var IME2MAC_sw = document.translate_form[1].checked;
var MAC2IME_sw = document.translate_form[2].checked;
var input_form = document.translate_form[INPUT_FORM_POS];
var output_form = document.translate_form[OUTPUT_FORM_POS];

var selfile_obj = document.getElementById("selfile");

selfile_obj.addEventListener("change", function(evt) {
    var file = evt.target.files;
    var fileName = file[0].name;

    var reader = new FileReader();


    if (fileName.toLowerCase().match(/\.(txt)$/i)) {
        element[0].checked = true;
    } else if (fileName.toLowerCase().match(/\.(plist)$/i)) {
        element[1].checked = true;
    } else {
        return;
    }
    reader.readAsText(file[0]);
    reader.onload = function(ev) {
        input_form.value = reader.result;
    }
}, false);

function Translate() {
    var IME2MAC_sw = document.translate_form[1].checked;
    var MAC2IME_sw = document.translate_form[2].checked;
    if (IME2MAC_sw) {
        Translate_IME2MAC();
    } else if (MAC2IME_sw) {
        Translate_MAC2IME();
    } else {
        alert("please select translate section");
    }
}

function Translate_IME2MAC() {
    input_lines = input_form.value.split("\n");
    output_line = "";
    for (var i = 0; i < input_lines.length; i++) {
        if (CountSeqInSentence(input_lines[i], "\t") >= 2) {
            input_words = input_lines[i].split("\t");
            if (!CheckNGWordsContainInSentence(input_words[0] + input_words[1])) {
                output_line += "\t<dict>\n" +
                    "\t\t<key>phrase</key>\n" +
                    "\t\t<string>" + input_words[1] + "</string>\n" +
                    "\t\t<key>shortcut</key>\n" +
                    "\t\t<string>" + input_words[0] + "</string>\n" +
                    "\t</dict>" + "\n";
            }
        }
    }
    output_form.value = plist_format_pre + output_line + plist_format_pos;
}

function Translate_MAC2IME() {
    input_lines = input_form.value.split("\n");
    output_line = "";

    for (var i = 6; i < input_lines.length - 5; i += 6) {
        input_phrase = input_lines[i].replace(/\t/g, "");
        input_shortcut = input_lines[i + 2].replace(/\t/g, "");
        output_phrase = input_phrase.substr(8, input_phrase.length - 17);
        output_shortcut = input_shortcut.substr(8, input_shortcut.length - 17);

        if (!CheckNGWordsContainInSentence(output_phrase + output_shortcut)) {
            output_line += output_shortcut + "\t" + output_phrase + "\t名詞\t\n";
        }
    }
    output_form.value = output_line;
}

function CheckNGWordsContainInSentence(str) {
    var sentence_NG = ["<", ">"];
    var res = false;
    for (var i = 0; i < sentence_NG.length; i++) {
        if (CountSeqInSentence(str, sentence_NG[i]) > 0) {
            res = true;
            break;
        }
    }
    return res;
}

function CountSeqInSentence(str, seq) {
    return (str.split(seq).length - 1);
}

function Export() {
    var IME2MAC_sw = document.translate_form[1].checked;
    var MAC2IME_sw = document.translate_form[2].checked;
    if (IME2MAC_sw) {
        var blob = new Blob(["\uFFFF", output_form.value]);
        var fileName = "output.plist";
    } else if (MAC2IME_sw) {
        var blob = new Blob(["\uFFFF", output_form.value]);
        var fileName = "output.txt";
    } else {
        alert("please select translate section");
        return;
    }
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, fileName);
        // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
        var export_block = document.getElementById("export")
        export_block.download = fileName;
        export_block.href = window.URL.createObjectURL(blob);
    }
}