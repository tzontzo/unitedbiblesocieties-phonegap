if( window.xhr ) {
	window.tinymce.dom.Event.domLoaded = true;
}

var versionForPath = '4.2.7';

function tinyMCEenable(selector, directionality, hgt, languageUsed) {
    baseDomain = schoolDomain.length > 0 ? schoolDomain : domain;
    
	if(document.body.clientWidth <= 768)
		return false;
	
	switch( languageUsed ) {
		case "us" :	languageUsed = "en_CA"; break;
		case "gb" :	languageUsed = "en_GB"; break;
		case "au" :	languageUsed = "en_AU"; break;
		case "pt" : languageUsed = "pt_PT"; break;
		case "in" : languageUsed = "hi"; break;
		case "si" : languageUsed = "sl"; break;
	}
	
	tinymce.baseURL = schoolProtocol + "://" + baseDomain + "/tinymce/" + versionForPath + "/js/tinymce";
	tinymce.baseURI.directory = schoolProtocol + "://" + baseDomain + "/tinymce/" + versionForPath + "/js/tinymce";
	tinymce.baseURI.path = schoolProtocol + "://" + baseDomain + "/tinymce/" + versionForPath + "/js/tinymce";
	tinymce.baseURI.relative = schoolProtocol + "://" + baseDomain + "/tinymce/" + versionForPath + "/js/tinymce";
	
	// console.log('[loading the tinymce ' + versionForPath + ' source]');

    root_block = 'p';
	
	// removed fullpage from plugin list to prevent the html, head and body tags insertion in source
	
	tinymce.init({
		forced_root_block: root_block,
		language: languageUsed,
		selector: selector,
        auto_focus: selector.replace('#', ''),
		directionality: directionality,
		skin: 'edu20',
		convert_urls: false,
		browser_spellcheck: true,
		paste_remove_styles: false,
		paste_remove_styles_if_webkit: false,
		paste_retain_style_properties : "all",
		valid_elements: "*[*]",
		valid_children: "*[*]",
		spellchecker_languages: languageUsed,
		spellchecker_rpc_url: schoolProtocol + "://" + baseDomain + "/tinymce/spellchecker",
		plugins: [
			"advlist autolink link image imageupload fileupload lists charmap print preview hr anchor pagebreak",
			"searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
			"table contextmenu directionality emoticons template textcolor paste textcolor matheditor poodll_audiorec"
		],
		toolbar1: "undo redo cut copy paste searchreplace alignleft aligncenter alignright alignjustify outdent indent bold italic underline strikethrough subscript superscript removeformat table code",
		toolbar2: "formatselect fontselect fontsizeselect bullist numlist forecolor backcolor link unlink hr imageupload emoticons matheditor charmap poodll_audiorec",
		menubar: false,
		height: hgt,
		content_css: [( directionality == "rtl" ? schoolProtocol + "://" + baseDomain + '/stylesheets/editor_new.rtl.css?12' : schoolProtocol + "://" + baseDomain + '/stylesheets/editor_mobile_app.css?12'),/* portal_stylesheet_url*/],
		block_formats: "Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6;Div=div;Address=address;Pre=pre;Code=code",
		style_formats: [
			{title: 'Paragraph', block: 'p'},
			{title: 'Header 1', block: 'h1'},
			{title: 'Header 2', block: 'h2'},
			{title: 'Header 3', block: 'h3'},
			{title: 'Header 4', block: 'h4'},
			{title: 'Header 5', block: 'h5'},
			{title: 'Header 6', block: 'h6'},
			{title: 'Div', block: 'div'},
			{title: 'Address', block: 'address'},
			{title: 'Pre', block: 'pre'},
			{title: 'Code', block: 'code'}
        ],
        font_formats: "Andale Mono=andale mono,monospace;" +
                 "Arial=arial,helvetica,sans-serif;" +
                 "Arial Black=arial black,sans-serif;" +
                 "Book Antiqua=book antiqua,palatino,serif;" +
                 "Comic Sans MS=comic sans ms,sans-serif;" +
                 "Courier New=courier new,courier,monospace;" +
                 "Georgia=georgia,palatino,serif;" +
                 "Helvetica=helvetica,arial,sans-serif;" +
                 "Impact=impact,sans-serif;" +
                 "Roboto='Roboto',helvetica,arial,sans-serif;" +
                 "Symbol=symbol;" +
                 "Tahoma=tahoma,arial,helvetica,sans-serif;" +
                 "Terminal=terminal,monaco,monospace;" +
                 "Times New Roman=times new roman,times,serif;" +
                 "Trebuchet MS=trebuchet ms,geneva,sans-serif;" +
                 "Verdana=verdana,geneva,sans-serif;" +
                 "Webdings=webdings;" +
                 "Wingdings=wingdings,zapf dingbats",
		setup: function(editor) {
			/* Activity detect inside tinymce */
			/*editor.on('Click', function(e){
				session_activity_detected();
			});
			editor.on('KeyPress', function(e){
				session_activity_detected();
			});
			editor.on('MouseMove', function(e){
				session_activity_detected();
			});*/
			/* activity detect tinymce END */
			
			editor.on('SaveContent', function(e) {
				var html = cleanHTML(e.content);
				$(e.element).val(html);
				e.content = html;
			});
			editor.on('NodeChange', function(e) {
				if( $(e.element).is("a") ) {
					$(".mce-ico.mce-i-unlink").parents(".mce-widget").first().css("display", "inline-block");
				} else {
					$(".mce-ico.mce-i-unlink").parents(".mce-widget").first().hide();
				}
			});
			editor.on('init', function(e) {
				editor.load();
				$(".mce-ico.mce-i-unlink").parents(".mce-widget").first().hide();
				if( $(".mce-mathquill-editor").size() ) {
					$(".mce-mathquill-editor").addClass("mce-widget mce-btn");
				}
			});
		}
	});
}

function cleanHTML(string){
	if(string) {
		string = string.replace('<!DOCTYPE html>','');
		string = string.replace(' class="_hovered"', '');
	}
	return string;
}

function triggerReloadModal(editor, $links, $elem, isCtrl) {
	editor.windowManager.open({
		title:"Close the editor?",
		file:schoolProtocol + "://" + baseDomain + "/tinymce/close",
		width:600,
		height:60,
		buttons:[{
			text:"Do not close",
			onclick:"close",
			classes:"widget btn primary first abs-layout-item"
		}, {
			text:"Close",
			onclick: function() {
				editor.windowManager.close();
				editor.destroy();
				editor.remove();
				$links.off("click.stopNormalFlow");
				$(window).off("keydown.stopNormalFlow").off("beforeunload");
				$(editor.getWin()).off("keydown.stopNormalFlow");
				if( $elem ) {
					document.location.href = $elem.attr("href");
				} else {
					location.reload(isCtrl);
				}
			},
			classes:"widget btn primary first abs-layout-item"						
		}]
	});
}
