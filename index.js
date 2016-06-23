var startData = "";
var endData = "";
var srtFileName = "";

var getSubtitles = function(hash) {
	var URL = 'https://subtitle-downloader.herokuapp.com/getSubtitle?lang=en&hash='+hash;
	$.get(URL, function(res){
		console.log('response :: ' + res);
		if(res != "error") {
			var blob = new Blob([res], {type: "text/plain;charset=utf-8"});
			saveAs(blob, srtFileName);
			$('.snackbar').css('background', 'green');
			$('.snackbar_text').text(srtFileName + ' downloaded.');
			$('.snackbar').css('display', 'block');
		} else {
			$('.snackbar').css('display', 'block');
			$('.snackbar').css('background', 'red');
			$('.snackbar_text').text('No subtitle found.');
		}
	
		$('.input_box').css('display', 'block');
		$('.processing_box').css('display', 'none');
	});
}

var set_data = function(a, b) {	
	switch (a) {
		case 0:
			startData = b;
			break;
		case 1:
			endData = b;
	}

	if(startData != "" && endData != "") {
		md5sum(startData, endData);
	}
};
	
var md5sum = function(_startData, _endData) {
	var _hash = rstr2hex(rstr_md5(_startData + _endData));
	getSubtitles(_hash);
};

var calculateHash = function(file) {
	$('.input_box').css('display', 'none');
	$('.processing_box').css('display', 'block');
	$('.snackbar').css('display', 'none');
	srtFileName = file.name.substr(0, file.name.lastIndexOf('.')) + '.srt';
	var first64ByteReader = new FileReader();
	var last64ByteReader = new FileReader();
	
	first64ByteReader.onload = function(a) {
		set_data(0, a.target.result)
	};
	last64ByteReader.onload = function(a) {
		set_data(1, a.target.result)
	};
	
	var start = file.slice(0, 65536);
	var end = file.slice(file.size - 65536, file.size);
	first64ByteReader.readAsBinaryString(start);
	last64ByteReader.readAsBinaryString(end);
};

$(document).ready(function () {
    var inputFile = $('#input_file');
    var boxWrapper = $('#box_wrapper');
    var arr = [];
    inputFile.on('change', function (e) {
        var file = $(this).prop('files')[0];
        if(!file.type.match(/video.*/)) {
			alert('Please select video file.');
			return false;
        }
		calculateHash(file);
	});
    boxWrapper.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#box_wrapper').css('border', '4px solid #bfbfb5');
	})
	.on('dragleave', function (e) {
    	e.preventDefault();
    	e.stopPropagation();
    	$('#box_wrapper').css('border', '4px dashed #bfbfb5');
	})
	.on('dragend', function (e) {
        e.preventDefault();
        e.stopPropagation();
	})
	.on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#box_wrapper').css('border', '4px dashed #bfbfb5');
        var file = e.originalEvent.dataTransfer.files[0];
        var arr = [file.path];
        calculateHash(file);
	});
	
	$('.close').click(function() {
		$('.snackbar').css('display', 'none');
	});
	
});
