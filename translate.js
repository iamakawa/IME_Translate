const plist_format_pre =
    '<?xml version = "1.0" encoding = "UTF-8" ?>' + '\n' +
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' + "\n" +
    '<plist version="1.0">' + "\n" +
    '<array>' + "\n";
const plist_format_pos =
    "</array>" + "\n" +
    "</plist>";

const INPUT_FORM_POS = 0;
const OUTPUT_FORM_POS = 4;

function Translate() {
    // 値を取得
    const IME2MAC_sw = document.translate_form[1].checked;
    const MAC2IME_sw = document.translate_form[2].checked;
    if (IME2MAC_sw) {
        Translate_IME2MAC();
    } else if (MAC2IME_sw) {
        Translate_MAC2IME();
    } else {
        alert("please select translate section");
    }
}

function Translate_IME2MAC() {
    const input_form = document.translate_form[INPUT_FORM_POS];
    const output_form = document.translate_form[OUTPUT_FORM_POS];

    input_lines = input_form.value.split("\n");
    output_line = "";
    for (var i = 0; i < input_lines.length; i++) {
        if (CountSeqInSentence(input_lines[i], "\t") >= 2) {
            input_words = input_lines[i].split("\t");
            if (!CheckNGWordsContainInSentence(input_words[0] + input_words[1])) {
                output_line += "<dict>" +
                    "<key>phrase</key>" +
                    "<string>" + input_words[1] + "</string>" +
                    "<key>shortcut</key>" +
                    "<string>" + input_words[0] + "</string>" +
                    "</dict>" + "\n";
            }
        }
    }
    output_form.value = plist_format_pre + output_line + plist_format_pos;
}

function Translate_MAC2IME() {
    const input_form = document.translate_form[INPUT_FORM_POS];
    const output_form = document.translate_form[OUTPUT_FORM_POS];

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