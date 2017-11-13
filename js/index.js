/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {

        document.addEventListener("offline", function() {
            app.toggleLoader(false);
            window.frames[0].stop();
            wasOffline = true;
            if (!/no_internet\.html/.test(document.getElementById('contentFrame').src)) {
                app.updateStatusMessage('Error Loading: No internet connection. Please try refreshing.');
            }
        }, false);

        /*document.addEventListener("online", function() {
         
         var contentFrame = document.getElementById('contentFrame');
         
         if(contentFrame.src != loginUrl) {
         app.toggleLoader(true);
         contentFrame.contentWindow.location.reload();
         }
         if(wasOffline) {
         app.updateStatusMessage('Loading: Internet connection restored');
         }
         }, false);*/

        document.addEventListener('resume', this.onAppLaunch, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('deviceready', this.onAppLaunch, false);
        document.addEventListener('deviceready', this.onDeviceReady, false);

        app.checkConnection();
    },

    onDeviceReady: function() {
        // Add the app version to the status bar
        if (appVersion) {
            document.getElementById("versionBlock").innerHTML = "V" + appVersion;
        }

        $(document).ready(function() {
            appPreloader = new $.materialPreloader({
                position: 'top',
                height: '5px',
                col_1: '#569a96',
                col_2: '#64cac2',
                col_3: '#aebfc2',
                col_4: '#E47E78',
                fadeIn: 200,
                fadeOut: 200
            });
            $('.load-bar').prependTo('#mobileAppWrapper');
            app.checkReachable();
            $('#infoBar .loaderBlock').click(function() {
                $(this).addClass('cross');
            });
        });
        //console.log("iOS version: "+window.device.version);
    },

    reloadPage: function() {
        var contentFrame = document.getElementById('contentFrame');
        app.toggleLoader(true);
        contentFrame.contentWindow.location.reload();
    },
    // Show loading animation
    toggleLoader: function(state) {
        if (state) {
            if ($(window).width() < 980) {
                $("#user-menu").trigger("close.mm");
            }
            if (appPreloader != null) {
                appPreloader.on();
            }
        } else {
            if (appPreloader != null) {
                appPreloader.off();
            }
            $('#infoBar .loaderBlock').removeClass('cross');
        }
    },
    //Update statusbar notification
    updateStatusMessage: function(statusMsg) {

        //console.log(statusMsg);
        var alertBlock = document.getElementById('alertBlock');
        if (alertBlock) {
            alertBlock.innerHTML = statusMsg;
        }
    },
    docLoaded: function() {
        //clearTimeout(connectionTimeout);
        var contentFrame = document.getElementById('contentFrame');
        contentFrame.contentDocument.body.onunload = app.loadingStart;
        //document.getElementById("versionBlock").style.display = 'none';

        // Redirect to the last URL.
        /*if(loginUrl != contentFrame.src){
         app.toggleLoader(true);
         contentFrame.contentWindow.location = loginUrl;
         }*/
    },
    checkConnection: function() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection';

        if (networkState == Connection.UNKNOWN || networkState == Connection.NONE) {

            app.updateStatusMessage('Error Loading: ' + states[networkState]);
            return false;
        }

        return true;
    },
    checkReachable: function() {
        //store.clear();
        console.log("check reachable");
        $.ajax(domainProtocol + '://' + domain, {
            statusCode: {
                404: function() {
                    console.log("not reachable: " + domainProtocol + '://' + domain);
                    $('#contentFrame').attr('src', 'no_internet.html');
                },
                200: function() {
                    app.toggleLoader(true);
                    app.updateStatusMessage('Loading...');
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.gotFSForSchoolRead, app.fail);
                }
            }
        });
    },
    errorEvent: function() {
        store.clear();
        $('#contentFrame').attr('src', loginUrl);
        app.toggleLoader(false);
        app.updateStatusMessage('');
    },
    checkTimeout: function() {

        var body = document.getElementById('contentFrame').contentDocument.getElementsByTagName('BODY')[0];
        if (!isPageLoaded && (body.readyState != 'loaded' || body.readyState != 'complete')) {
            //window.frames[0].stop();
            //app.toggleLoader(false);
            app.updateStatusMessage('Error Loading: Request Timeout after ' + connectionTimeoutSeconds + ' seconds');

            if (confirm('Would you like to re-try loading this document?')) {
                app.updateStatusMessage('');
                document.getElementById('contentFrame').contentWindow.location.reload();
            } else {
                window.frames[0].stop();
                app.toggleLoader(false);
            }
        }
    },
    loadingStart: function() {
        app.updateStatusMessage('');
        isPageLoaded = false;
        if (app.checkConnection()) {
            //connectionTimeout = setTimeout(app.checkTimeout,connectionTimeoutSeconds*1000);
            app.toggleLoader(true);

            if (isFirst) {
                app.updateStatusMessage('Loading...');
                isFirst = false;
            }
        }
    },
    loadPrevious: function() {
        app.toggleLoader(true);
        wentBack = true;
        pageHistoryMarker--;
        //alert("going back, loading "+pageHistory[pageHistoryMarker]);
        $('#contentFrame').attr('src', pageHistory[pageHistoryMarker]);
    },
    loadNext: function() {
        app.toggleLoader(true);
        wentForward = true;
        pageHistoryMarker++;
        //alert("going forward, loading "+pageHistory[pageHistoryMarker]);
        $('#contentFrame').attr('src', pageHistory[pageHistoryMarker]);
    },
    enableLeftArrow: function() {
        $('#arrowLeft').removeClass('inactive');
        $('#arrowLeft').off("click");
        $('#arrowLeft').on("click", app.loadPrevious);
    },
    enableRightArrow: function() {
        $('#arrowRight').removeClass('inactive');
        $('#arrowRight').off("click");
        $('#arrowRight').on("click", app.loadNext);
    },
    disableLeftArrow: function() {
        $('#arrowLeft').addClass('inactive');
        $('#arrowLeft').off("click");
    },
    disableRightArrow: function() {
        $('#arrowRight').addClass('inactive');
        $('#arrowRight').off("click");
    },
    loadComplete: function() {
        app.sendViewportData();
        console.log('Sending viewport data');
        isPageLoaded = true;
        var contentFrame = document.getElementById('contentFrame');
        contentFrame.contentDocument.body.onunload = app.loadingStart;
        $('#alertBlock').html('');
        app.toggleLoader(false);
        $(window).scrollTop(0);
        if ($('nav#leftColumn ol.thinMainNav').hasClass('hoverMainNav')) {
            closeThinNav();
        }
        app.enableRefreshHeader();
        //$('#splashScreen').hide();
        //if(!$('header').is(':visible'))
        //console.log("Page history: "+pageHistory);
    },
    receiveExternalMessage: function(data, origin) {
        $('#splashScreen').fadeOut(700);
        $('#infoBar, #contentFrame').fadeIn(700);
        $('body').css('background', '#FFF');
        switch (data.method) {
            case 'toggleLoader':
                if (data.action == 'start') {
                    app.toggleLoader(true);
                }
                if (data.action == 'stop') {
                    app.toggleLoader(false);
                }
                break;
            case 'statusMessage':
                if (data.text !== '') {
                    app.updateStatusMessage(data.text);
                }
                break;
            case 'uploadFile':
                if (data.filename !== '') {
                    app.uploadToLocker(data.filename);
                }
                break;
            case 'logIn':
                if (data.action == 'login') {
                    //console.log('Logging in');
                    loggedIn = true;
                    if (!navigator.userAgent.match(/Android/i)) {
                        $('header').show();
                    }
                    var contentFrame = document.getElementById('contentFrame');

                    if (!wentBack && !wentForward) {
                        //console.log("running history code");
                        pageHistoryMarker++;
                        if (pageHistoryMarker < pageHistory.length) {
                            pageHistory.splice(pageHistoryMarker, 20);
                        }
                        pageHistory.push(contentFrame.contentWindow.location.href);
                        if (pageHistory.length > 20) {
                            pageHistory.shift();
                            pageHistoryMarker--;
                        }
                    }
                    wentBack = false;
                    wentForward = false;
                    //alert("history length: "+pageHistory.length+" - history marker: "+pageHistoryMarker);
                    if (pageHistoryMarker > 0) {
                        canGoBack = true;
                    }
                    if (pageHistoryMarker == 0) {
                        canGoBack = false;
                    }
                    if (pageHistoryMarker < pageHistory.length - 1) {
                        canGoForward = true;
                    }
                    if (pageHistoryMarker == pageHistory.length - 1) {
                        canGoForward = false;
                    }

                    app.updateStatusMessage('Please wait...');
                    if (fileToUpload.length) {
                        $('#contentFrame').attr('src', schoolProtocol + '://' + schoolDomain + '/resources/upload_mobile/?filename=' + fileToUpload);
                        fileToUpload = '';
                    } else {
                        app.updateStatusMessage('');
                    }
                    $('#versionBlock').hide();
                    $('#arrowLeft, #arrowRight').show();
                    $('#arrowLeft, #arrowRight').blur();
                    $('#homeButton').show();
                    if (canGoBack) {
                        app.enableLeftArrow();
                    } else {
                        app.disableLeftArrow();
                    }
                    if (canGoForward) {
                        app.enableRightArrow();
                    } else {
                        app.disableRightArrow();
                    }
                    var loginUsernameTemp = store.getItem('loginUsernameTemp');
                    var loginPasswordTemp = store.getItem('loginPasswordTemp');
                    console.log('Looking for login data in local storage, loginUsernameTemp: ' + loginUsernameTemp + ', loginPasswordTemp: ' + loginPasswordTemp);
                    if (loginUsernameTemp && loginPasswordTemp) {
                        console.log('Found login data in local storage.');
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.storeLoginCredentials, app.fail);
                    }
                }
                break;
            case 'logOut':
                if (data.action == 'logout') {
                    //console.log('Logging out');
                    loggedIn = false;
                    $('header').hide();
                    $('#arrowLeft, #arrowRight').hide();
                    $('#versionBlock').show();
                    $('#homeButton').hide();
                    pageHistory = [];
                    pageHistoryMarker = -1;
                    app.hideLeftNav();
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.deleteLoginCredentials, app.fail);
                }
                break;
            case 'setSchoolDomain':
                if (data.domain !== '') {
                    if (/https:\/\//i.test(origin)) {
                        schoolProtocol = 'https';
                    }
                    newSchoolDomain = origin.replace('http://', '');
                    newSchoolDomain = newSchoolDomain.replace('https://', '');
                    if (newSchoolDomain != schoolDomain) {
                        schoolDomain = newSchoolDomain;
                        $('head link').each(function(index) {
                            $(this).attr('href', $(this).attr('href').replace('http://' + domain, schoolProtocol + '://' + schoolDomain));
                        });
                    }
                    store.setItem('currentSchool', schoolProtocol + '://' + schoolDomain + '/?mobile_app=true' + (isBrandedApp ? '&branded_app=true' : ''));
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.storeCurrentSchool, app.fail);
                    //console.log('Selected school: '+schoolDomain);
                }
                break;
            case 'headerContent':
                if (data.content !== '' && canRefreshHeader) {
                    headerContent = data.content;
                    app.refreshHeader();
                }
                break;
            case 'leftNavContent':
                if (data.content !== '') {
                    leftNavContent = data.content;
                    app.refreshLeftNav();
                }
                break;
            case 'showLeftNav':
                if (data.content == '1') {
                    app.showLeftNav();
                }
                break;
            case 'hideLeftNav':
                if (data.content == '1') {
                    app.hideLeftNav();
                }
                break;
            case 'mobileNavContent':
                if (data.content !== '') {
                    mobileNavContent = data.content;
                    if ($('nav#user-menu').hasClass('mm-opened')) {
                        $('nav#user-menu').on('closed.mm', function() {
                            app.refreshMobileNav();
                        });
                        $('nav#user-menu').trigger('close.mm');
                    } else {
                        app.refreshMobileNav();
                    }

                }
                break;
            case 'portalStylesheet':
                if (data.tag !== '') {
                    $('head link').each(function(index) {
                        if ($(this).attr('href').indexOf('/themes/') > -1 || $(this).attr('href').indexOf('/files/') > -1) {
                            $(this).replaceWith(data.tag);
                        }
                    });
                    portalStylesheet = data.tag;
                }
                break;
            case 'headerBackground':
                if (data.code !== '') {
                    $('#loadingOverlay span').css('background-color', data.code);
                }
                break;
            case 'getScrollTop':
                app.sendViewportData();
                break;
            case 'setScrollTop':
                if (data.amount !== '') {
                    $(window).scrollTop(data.amount);
                }
                break;
            case 'loadBrowser':
                if (data.href !== '') {
                    if (data.href.substring(0, 1) == '/') {
                        data.href = schoolProtocol + '://' + schoolDomain + data.href;
                    }
                    newWindow = window.open(data.href, '_blank', 'location=yes');
                    console.log('opening ' + data.href);
                    if (typeof data.refresh_on_close != 'undefined') {
                        newWindow.addEventListener('loadstop', function(event) {
                            if (event.url.startsWith(schoolProtocol + '://' + schoolDomain)) {
                                newWindow.close();
                                var contentFrame = document.getElementById('contentFrame');
                                contentFrame.contentWindow.location = contentFrame.contentWindow.location.href + '&sso_native_apps_alert=false';
                            }
                        });
                    }
                }
                break;
            case 'openChat':
                if (data.url !== '') {
                    create_chat(schoolProtocol + '://' + schoolDomain + data.url);
                }
                break;
            case 'inputFocused':
                if (parseInt(data.action) == 1) {
                    inputFocusedActions();
                }
                break;
            case 'inputBlurred':
                if (parseInt(data.action) == 1) {
                    inputBlurredActions();
                }
                break;
            case 'courseToolbar':
                if (!navigator.userAgent.match(/Android/i)) {
                    if (typeof data.content != 'undefined') {
                        $('#courseToolbar').html(data.content);
                        $('#courseToolbar').css({
                            top: 40,
                            width: $(window).width() - 125,
                        });
                        $('#courseToolbar').show();
                    }
                    if (typeof data.hide != 'undefined') {
                        $('#courseToolbar').hide();
                    }
                    tabnav_adjustment('#courseToolbar');
                }
                break;
            case 'openExternal':
                if (typeof data.url != 'undefined') {
                    if (data.url.indexOf('http://') > -1 || data.url.indexOf('https://') > -1) {
                        var externalWindow = window.open(data.url, '_system');
                    } else {
                        var externalWindow = window.open(schoolProtocol + '://' + schoolDomain + data.url, '_system');
                    }
                }
                break;
            case 'responseForMessages':
                if (typeof data.data != 'undefined') {
                    ajax_call_for_messages(data.container, data.controller, data.data);
                }
                break;
            case 'leftNavHeight':
                if (typeof data.content != 'undefined') {
                    leftNavHeight = data.content;
                }
                break;
            case 'faceboxOpened':
                if (data.content == '1') {
                    if ($('nav#leftColumn').attr('style') == 'display: block;') {
                        $('nav#leftColumn').attr('stays-visible', 'yes');
                        $('nav#leftColumn').hide();
                    }
                    if ($(window).width() < 980) {
                        $(window).scrollTop(0);
                    }
                    app.enableRefreshHeader();
                }
                break;
            case 'faceboxClosed':
                if (data.content == '1') {
                    if ($('nav#leftColumn').attr('stays-visible') == 'yes' && !navigator.userAgent.match(/Android/i)) {
                        $('nav#leftColumn').show();
                    }
                    $('nav#leftColumn').removeAttr('stays-visible');
                }
                break;
            case 'enableRTL':
                if (typeof data.url != 'undefined') {
                    if (schoolDomain.length) {
                        $('head').append('<link href="' + schoolProtocol + '://' + schoolDomain + data.url + '" media="screen" id="rtl_stylesheet" rel="stylesheet" type="text/css" />');
                    } else {
                        $('head').append('<link href="' + domainProtocol + '://' + domain + data.url + '" media="screen" id="rtl_stylesheet" rel="stylesheet" type="text/css" />');
                    }
                    $('html').attr('dir', 'RTL');
                }
                break;
            case 'disableRTL':
                if (data.content == '1') {
                    $('#rtl_stylesheet').remove();
                    $('html').removeAttr('dir');
                    //maybe refresh the whole page
                }
                break;
            case 'editorFocused':
                if (typeof data.content != 'undefined') {
                    $('#infoBar').hide();
                    var content = data.content.replace('src="/', 'src="' + schoolProtocol + '://' + schoolDomain + '/');
                    $('#editorContent').val(content);
                    $('.editorContainer .facebox-content').css({
                        width: originalWidth - 20,
                        minHeight: $('#contentFrame').height() - 98
                    });
                    $('.editorContainer').show();
                    tinyMCEenable("#editorContent", "ltr", $('#contentFrame').height() - 210, "en");
                }
                break;
            case 'activateSaveButton':
                if (typeof data.content != 'undefined') {
                    console.log('activateSaveButton, $(\'.mce-imageinsert-btn\'): ' + $('.mce-imageinsert-btn').first().length);
                    $('.mce-md-local').remove();
                    $('.mce-foot > .mce-abs-layout').prepend('<a href="javascript:void(0)" id="editor_save_btn">Save</a>');
                    $('#editor_save_btn').click(function() {
                        window.frames[3].postMessage("{\"getUploadedImage\": \"1\"}", "*");
                    });
                }
                break;
            case 'editorUploadedImage':
                if (typeof data.filename != 'undefined') {
                    var wd = data.img_width,
                        hg = data.img_height,
                        brd = data.img_border;
                    var origWidth = parseInt(data.origWidth, 10),
                        origHeight = parseInt(data.origHeight, 10);
                    var editor = tinyMCE.activeEditor;
                    var dom = editor.dom;
                    var data = {
                        id: '__mcenew',
                        src: schoolProtocol + '://' + schoolDomain + data.filename,
                        alt: data.img_alt,
                        width: (wd ? wd : origWidth),
                        height: (hg ? hg : origHeight),
                        style: "width:" + (wd ? wd : origWidth) + "px; height:" + (hg ? hg : origHeight) + "px;" + (brd ? ' border:' + brd + 'px solid #ccc;' : '')
                    };
                    editor.undoManager.transact(function() {
                        editor.insertContent(dom.createHTML('img', data));
                        var imgElm = dom.get('__mcenew');
                        dom.setAttrib(imgElm, 'id', null);
                        waitLoad(imgElm, data);
                    });
                }
                break;
            case 'updateSectionTitle':
                if (typeof data.content != 'undefined') {
                    $('header .sectionTitle h2').html(data.content);
                }
                break;
            case 'clearStorage':
                if (typeof data.action != 'undefined') {
                    store.clear();
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.deleteCurrentSchool, app.fail);
                }
                break;
            case 'refreshBodyHeight':
                if (typeof data.value != 'undefined') {
                    console.log('refreshing body height');
                    var body_height = $('body').css('height');
                    $('body').css('height', 0);
                    $('body').css('height', body_height);
                }
                break;
            case 'updateStatusMessage':
                if (typeof data.content != 'undefined') {
                    app.updateStatusMessage(data.content);
                }
                break;
            case 'downloadFile':
                if (typeof data.content != 'undefined') {
                    app.updateStatusMessage('Downloading file...');
                    app.toggleLoader(true);
                    var URL = schoolProtocol + '://' + schoolDomain + data.content;
                    var Folder_Name = 'Download';
                    var File_Name = data.content.split('/');
                    File_Name = File_Name[File_Name.length - 1].split('?');
                    File_Name = File_Name[0];

                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);

                    function fileSystemSuccess(fileSystem) {
                        var download_link = encodeURI(URL);

                        var directoryEntry = fileSystem.root; // to get root path of directory
                        directoryEntry.getDirectory(Folder_Name, {
                            create: true,
                            exclusive: false
                        }, onDirectorySuccess, onDirectoryFail); // creating folder in sdcard
                        var rootdir = fileSystem.root;
                        var fp = rootdir.toURL(); // Returns Fulpath of local directory

                        fp = fp + "/" + Folder_Name + "/" + File_Name; // fullpath and name of the file which we want to give
                        // download function call
                        filetransfer(download_link, fp);
                    }

                    function onDirectorySuccess(parent) {
                        console.log('directory created successfully');
                        // Directory created successfuly
                    }

                    function onDirectoryFail(error) {
                        //Error while creating directory
                        console.log("Unable to create new directory: " + error.code);
                    }

                    function fileSystemFail(evt) {
                        //Unable to access file system
                        console.log(evt.target.error.code);
                    }

                    function filetransfer(download_link, fp) {
                        var fileTransfer = new FileTransfer();
                        // File download function with URL and local path
                        fileTransfer.download(download_link, fp,
                            function(entry) {
                                alert('The file was successfully downloaded, you can access it in /' + Folder_Name + '/' + File_Name + '.');
                                app.updateStatusMessage('');
                                app.toggleLoader(false);
                                console.log("download complete: " + entry.fullPath);
                            },
                            function(error) {
                                //Download abort errors or download failed errors
                                console.log("download error source " + error.source);
                                console.log("download error target " + error.target);
                                console.log("upload error code" + error.code);
                            }
                        );
                    }
                }
                break;
            case 'registerNotifications':
                if (data.content == '1') {
                    app.registerNotifications();
                }
                break;
            case 'loginCredentials':
                if (typeof data.userid != 'undefined') {
                    store.setItem('loginUsernameTemp', data.userid);
                    store.setItem('loginPasswordTemp', data.password);
                }
                break;
            case 'notificationsPopup':
                if (data.content == '1') {
                    $('.notificationsPopUpHolder').find('.notificationsBottom span').on('click', function(data) {
                        $.each($('.notificationsPopUpHolder').find('> div > ul li'), function() {
                            $(this).animate({
                                height: '0'
                            }, 300, function() {
                                $(this).remove();
                                if ($('.notificationsPopUpHolder').find('> div > ul li').length == 0) {
                                    $('.notificationsPopUpHolder').find('.notificationsBottom').hide();
                                }
                            });
                        });
                    });
                    $('.notificationsPopUpHolder > div > ul > li > a').click(function() {
                        $('.notificationsPopUpHolder').find('.notificationsBottom').hide();
                    });
                    $('.notificationsPopUpHolder > div > ul > li').each(function() {
                        notifications_animate('.notificationsPopUpHolder .' + $(this).attr('class'));
                    });
                }
                break;
            case 'playNotificationSound':
                if (typeof data.src != 'undefined') {
                    var media = new Media(schoolProtocol + '://' + schoolDomain + data.src,
                        function() {
                            console.log('Successfully loaded media');
                        },
                        function(data) {
                            console.log('Error loading media: ' + data.error);
                        });
                    media.play();
                }
                break;
            case 'closeSSOWindow':
                console.log('received message to close sso window');
                if (ssoWindow != null) {
                    console.log('close sso window');
                    ssoWindow.close();
                }
                break;
            default:
                return;
                break;
        }
    },
    sendViewportData: function() {
        document.getElementById('contentFrame').contentWindow.postMessage("{\"windowHeight\": \"" + $(window).height() + "\", \"windowWidth\": \"" + $(window).width() + "\", \"scrollTop\": \"" + $(window).scrollTop() + "\"}", "*");
    },
    onAppLaunch: function() {
        //console.log('checking if file was selected');
        if (!navigator.userAgent.match(/Android/i)) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.gotFS, app.fail);
        }
        canLoadNotification = true;
        setTimeout(function(){
        	canLoadNotification = false;
        }, 1000);
    },
    onPause: function() {
        if (!navigator.userAgent.match(/Android/i)) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.gotFSforDelete, app.fail);
        }
    },
    gotFSforDelete: function(fileSystem) {
        fileSystem.root.getDirectory('Inbox', {
            create: false
        }, app.readInboxForDelete, app.fail);
    },
    readInboxForDelete: function(dirEntry) {
        var directoryReader = dirEntry.createReader();
        directoryReader.readEntries(app.deleteInbox, app.fail);
    },
    deleteInbox: function(entries) {
        var i;
        for (i = 0; i < entries.length; i++) {
            entries[i].remove(
                function(entry) {
                    //console.log('File deleted: '+entry.name);
                },
                app.fail
            );
        }
    },
    gotFS: function(fileSystem) {
        fileSystem.root.getDirectory('Inbox', {
            create: false
        }, app.readDirectory, app.fail);
    },
    readDirectory: function(dirEntry) {
        var directoryReader = dirEntry.createReader();
        directoryReader.readEntries(app.showEntries, app.fail);
    },
    showEntries: function(entries) {
        var iframeURL = '';
        if (entries.length) {
            //console.log('file selected: '+entries[0].name);
            if (loggedIn) {
                iframeURL = schoolProtocol + '://' + schoolDomain + '/resources/upload_mobile/?filename=' + entries[0].fullPath;
            } else {
                fileToUpload = entries[0].fullPath;
                if (schoolDomain.length) {
                    iframeURL = schoolProtocol + '://' + schoolDomain + '/?mobile_app=true' + (isBrandedApp ? '&branded_app=true' : '');
                } else {
                    iframeURL = loginUrl;
                }
            }
            $('#contentFrame').attr('src', iframeURL);
            console.log('Opening URL: ' + iframeURL);
            //app.uploadToLocker(entries[0].fullPath);
        }
    },
    uploadToLocker: function(fileURI) {
        //console.log('Uploading '+fileURI);
        var ft = new FileTransfer();
        var options = new FileUploadOptions();
        options.fileKey = "attachment";
        options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        options.mimeType = "text/plain";

        var params = {};
        params["resource[description]"] = options.fileName + " - via mobile app";
        params.scope = "User";

        options.params = params;

        ft.upload(fileURI, encodeURI(schoolProtocol + "://" + schoolDomain + "/locker/create?type=FileResource"), app.transferSuccess, app.transferFail, options);
        ft.onprogress = function(progressEvent) {
            var uploadProgress = 0;
            if (progressEvent.lengthComputable) {
                app.updateStatusMessage('Uploading ' + options.fileName + ': ' + (parseInt(progressEvent.loaded / progressEvent.total * 100)) + '%');
                if (progressEvent.loaded / progressEvent.total == 1) {
                    app.onPause();
                }
                //console.log(progressEvent.loaded / progressEvent.total);
            } else {
                uploadProgress++;
                app.updateStatusMessage('Uploading ' + options.fileName + ': ' + uploadProgress + '%');
                //console.log(uploadProgress);
            }
        };
    },
    transferSuccess: function(r) {
        //console.log("Code = " + r.responseCode);
        //console.log("Response = " + r.response);
        //console.log("Sent = " + r.bytesSent);
        app.updateStatusMessage('Please wait...');
        var response_obj = JSON.parse(r.response);
        $('#contentFrame').attr('src', response_obj.url);
    },
    transferFail: function(error) {
        //console.log("An error has occurred: Code = " + error.code);
        //console.log("upload error source " + error.source);
        //console.log("upload error target " + error.target);
        app.updateStatusMessage('Upload error');
        $('#contentFrame').attr('src', schoolProtocol + '://' + schoolDomain + '/');
    },
    storeToken: function(receivedToken) {
        if (navigator.userAgent.match(/Android/i)) {
            document.getElementById('contentFrame').contentWindow.postMessage("{\"androidToken\": \"" + receivedToken + "\"}", "*");
        } else {
            document.getElementById('contentFrame').contentWindow.postMessage("{\"iosToken\": \"" + receivedToken + "\"}", "*");
        }
    },
    fail: function(evt) {
        //console.log("Error: " + evt.target.error.code);
    },
    refreshHeader: function() {
        //console.log("refreshing header");
        $('header').html(headerContent);
        $('.sectionTitle h2').css('width', $('#mobileAppWrapper').width() - $('.sectionTitle + .quickLinks').outerWidth() - 250);
        dropdownClickEvents();
        lessonNavEvents();
        fix_mobile_title_wrapping();
        messages_box_offset = 0;
        initLeftNavButton();
        $('.leftMobileBar').click(function(e) {
            $(window).scrollTop(0);
            $('nav#user-menu').trigger('open.mm');
        });
        $('header *').click(function(){
        	app.disableRefreshHeader();
        });
    },
    refreshLeftNav: function() {
        //console.log('refreshing left nav');
        $('nav#leftColumn ol.thinMainNav').removeData().html(leftNavContent);
        initLeftNav();
        hookFlyOutEvents('thinMainNav');
    },
    showLeftNav: function() {
        if (!navigator.userAgent.match(/Android/i)) {
            $('nav#leftColumn').show();
        }
    },
    hideLeftNav: function() {
        $('nav#leftColumn').hide();
    },
    refreshMobileNav: function() {
        console.log('refreshing mobile nav');
        $('nav#user-menu').remove();
        $('body').append(mobileNavContent);
        initMobileMenuEvents();
        $('nav#user-menu').on('opening.mm', function() {
            console.log('opening mmenu');
        });
        $('nav#user-menu').on('opened.mm', function() {
            $('#mobileAppWrapper').css({
                'position': 'static',
                'margin-left': $('nav#user-menu').outerWidth()
            });
            if (!navigator.userAgent.match(/Android/i) && parseFloat(window.device.version) < 8.0) {
                if ($('nav#user-menu #btn-root').is(':visible')) {
                    $('nav#user-menu #btn-root').click();
                    setTimeout(function() {
                        $('nav#user-menu #btn-down').click();
                    }, 1);
                } else {
                    if ($('nav#user-menu > ol > li.mm-opened').length > 0) {
                        $('nav#user-menu > ol > li.mm-opened').addClass('mm-opened-temp').removeClass('mm-opened');
                        setTimeout(function() {
                            $('nav#user-menu > ol > li.mm-opened-temp').addClass('mm-opened').removeClass('mm-opened-temp');
                        }, 1);
                    }
                }
            }
            $('nav#user-menu > ol > li:last-child').css('margin-bottom', 40);
        });
        $('nav#user-menu').on('closing.mm', function() {
            $('#mobileAppWrapper').removeAttr('style');
        });
    },
    goHome: function() {
        app.toggleLoader(true);
        $('#contentFrame').attr('src', schoolProtocol + '://' + schoolDomain + '/');
    },
    registerNotifications: function() {
    	if (navigator.userAgent.match(/Android/i)) {
    		var options = {
    			android: {
					senderID: androidSenderID,
					clearBadge: true
				}
    		};
    	} else {
    		var options = {
				ios: {
					alert: true,
					badge: true,
					sound: true,
					clearBadge: true
				}
    		};
    	}
		
		var push = PushNotification.init(options);
		
        var pushToken = store.getItem('pushToken');
        if (pushToken) {
            app.storeToken(pushToken);
        } else {
            try {
				push.on('registration', function(data) {
					store.setItem('pushToken', data.registrationId);
                    app.storeToken(data.registrationId);
				});
            } catch (err) {
                console.log("Error: " + err.message);
            }
        }
        
        push.on('notification', app.onNativeNotification);
		push.on('error', function(e) {
			console.log("Push plugin error" + e.message);
		});
    },
    onNativeNotification: function(data) {
    	if(canLoadNotification){
    		var item_id = /\(ID: ([0-9]*)\)$/.exec(data.message);
			var currentSchool = store.getItem('currentSchool');
			console.log('is alert, item_id: ' + JSON.stringify(item_id));
			if (data.message.charAt(0) == 'M') {
				console.log('loading: ' + currentSchool.replace('?mobile_app=true', 'inbox/show?message=' + item_id[1]));
				app.toggleLoader(true);
				app.updateStatusMessage('Loading message...');
				$('#contentFrame').attr('src', currentSchool.replace('?mobile_app=true', 'inbox/show?message=' + item_id[1]));
			} else {
				console.log('loading: ' + currentSchool.replace('?mobile_app=true', 'notifications/show?notification=' + item_id[1]));
				app.toggleLoader(true);
				app.updateStatusMessage('Loading notification...');
				$('#contentFrame').attr('src', currentSchool.replace('?mobile_app=true', 'notifications/show?notification=' + item_id[1]));
			}
			canLoadNotification = false;
    	}
    },
    storeLoginCredentials: function(fileSystem) {
        console.log('storeLoginCredentials');
        fileSystem.root.getFile("login.txt", {
            create: true,
            exclusive: false
        }, app.gotLoginFileEntry, app.fail);
    },
    gotLoginFileEntry: function(fileEntry) {
        console.log('gotLoginFileEntry');
        fileEntry.createWriter(app.gotLoginFileWriter, app.fail);
    },
    gotLoginFileWriter: function(writer) {
        console.log('gotLoginFileWriter');
        writer.write(store.getItem('loginUsernameTemp') + "\n" + store.getItem('loginPasswordTemp'));
    },
    storeCurrentSchool: function(fileSystem) {
        console.log('storeCurrentSchool');
        fileSystem.root.getFile("school.txt", {
            create: true,
            exclusive: false
        }, app.gotSchoolFileEntry, app.fail);
    },
    gotSchoolFileEntry: function(fileEntry) {
        console.log('gotSchoolFileEntry');
        fileEntry.createWriter(app.gotSchoolFileWriter, app.fail);
    },
    gotSchoolFileWriter: function(writer) {
        console.log('gotSchoolFileWriter');
        writer.write(store.getItem('currentSchool'));
    },
    gotFSForLoginRead: function(fileSystem) {
        console.log('gotFSForLoginRead');
        fileSystem.root.getFile("login.txt", {
            create: true,
            exclusive: false
        }, app.gotFileEntryForLoginRead, app.fail);
    },
    gotFileEntryForLoginRead: function(fileEntry) {
        console.log('gotFileEntryForLoginRead');
        fileEntry.file(app.gotFileForLoginRead, app.fail);
    },
    gotFileForLoginRead: function(file) {
        var currentSchool = store.getItem('currentSchool');
        console.log('gotFileForLoginRead');
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Read as text");
            var loginCredentials = evt.target.result;
            console.log('loginCredentials: ' + loginCredentials);
            if (loginCredentials.length) {
                var loginCredentialsArray = loginCredentials.split("\n");
                if (loginCredentialsArray[0] == 'auth_token_sso') {
                    console.log('auth token found, opening ' + currentSchool.replace('?mobile_app=true', 'log_in/submit?auth_token=' + loginCredentialsArray[1] + '&mobile_app=true' + (isBrandedApp ? '&branded_app=true' : '')));
                    $('#contentFrame').attr('src', currentSchool.replace('?mobile_app=true', 'log_in/submit?auth_token=' + loginCredentialsArray[1] + '&mobile_app=true' + (isBrandedApp ? '&branded_app=true' : '')));
                } else {
                    console.log('loginCredentials found, opening ' + currentSchool.replace('?mobile_app=true', 'log_in/submit?userid=' + loginCredentialsArray[0] + '&password=' + loginCredentialsArray[1] + '&mobile_app=true' + (isBrandedApp ? '&branded_app=true' : '')));
                    $('#contentFrame').attr('src', currentSchool.replace('?mobile_app=true', 'log_in/submit?userid=' + loginCredentialsArray[0] + '&password=' + loginCredentialsArray[1] + '&mobile_app=true' + (isBrandedApp ? '&branded_app=true' : '')));
                }
            } else {
                $('#contentFrame').attr('src', currentSchool);
            }
            app.toggleLoader(false);
        };
        reader.readAsText(file);
    },
    deleteLoginCredentials: function(fileSystem) {
        console.log('deleteLoginCredentials');
        fileSystem.root.getFile("login.txt", {
            create: true,
            exclusive: false
        }, app.gotDeleteLoginFileEntry, app.fail);
    },
    gotDeleteLoginFileEntry: function(fileEntry) {
        console.log('gotDeleteLoginFileEntry');
        fileEntry.createWriter(app.gotDeleteLoginFileWriter, app.fail);
    },
    gotDeleteLoginFileWriter: function(writer) {
        console.log('gotDeleteLoginFileWriter');
        writer.write("");
    },
    gotFSForSchoolRead: function(fileSystem) {
        console.log('gotFSForSchoolRead');
        fileSystem.root.getFile("school.txt", {
            create: true,
            exclusive: false
        }, app.gotFileEntryForSchoolRead, app.fail);
    },
    gotFileEntryForSchoolRead: function(fileEntry) {
        console.log('gotFileEntryForSchoolRead');
        fileEntry.file(app.getCurrentSchool, app.fail);
    },
    getCurrentSchool: function(file) {
        console.log('getCurrentSchool');
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Read as text");
            var currentSchool = evt.target.result + '&sso_native_apps=true';
            console.log('currentSchool: ' + currentSchool);
            if (currentSchool.length) {
                $.ajax(currentSchool, {
                    statusCode: {
                        404: app.errorEvent,
                        200: function() {
                            store.setItem('currentSchool', currentSchool);
                            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.gotFSForLoginRead, app.fail);
                        }
                    },
                    timeout: 5000,
                    error: app.errorEvent
                });
            } else {
                console.log("loading " + loginUrl);
                $('#contentFrame').attr('src', loginUrl);
            }
            app.toggleLoader(false);
        };
        reader.readAsText(file);
    },
    deleteCurrentSchool: function(fileSystem) {
        console.log('deleteCurrentSchool');
        fileSystem.root.getFile("school.txt", {
            create: true,
            exclusive: false
        }, app.gotDeleteSchoolFileEntry, app.fail);
    },
    gotDeleteSchoolFileEntry: function(fileEntry) {
        console.log('gotDeleteSchoolFileEntry');
        fileEntry.createWriter(app.gotDeleteSchoolFileWriter, app.fail);
    },
    gotDeleteSchoolFileWriter: function(writer) {
        console.log('gotDeleteSchoolFileWriter');
        writer.write("");
    },
    disableRefreshHeader: function() {
    	console.log('disable refresh header');
    	canRefreshHeader = false;
    },
    enableRefreshHeader: function() {
    	console.log('enable refresh header');
    	canRefreshHeader = true;
    }
};

function popup_clicked(element) {
    $("#user-menu").trigger("close.mm");
    closeThinNav();
    $('nav#leftColumn').hide();
    setTimeout(function() {
        if (!navigator.userAgent.match(/Android/i)) {
            $('nav#leftColumn').show();
        }
    }, 50);
    if ($(window).width() > 980) {
        document.getElementById('contentFrame').contentWindow.postMessage("{\"getHeader\": \"1\"}", "*");
    }
    document.getElementById('contentFrame').contentWindow.postMessage("{\"openPopup\": \"" + $(element).attr('href') + "\"}", "*");
    return false;
}

function create_chat(url) {
    var args = get_args(url);
    var chatroom_id = args['chat_room_id']; // should always be present
    var chatroom_name = (args['chat_room_name'] ? decodeURIComponent(args['chat_room_name']) : 'Chat');
    var invited_user_id = (args['invited_user_id'] || 'null');

    var chatContainer = '<div id="chatContainer" chatroom_id="' + chatroom_id + '"><div class="header"><h4>' + chatroom_name.replace(/\+/g, " ").replace(/%27/g, "'") + '</h4><a href="javascript:void(0)" onclick="close_chat(' + chatroom_id + ', ' + invited_user_id + ')" class="close"><i class="xCross inverted"></i></a></div><div id="chatIframe"><iframe src="' + url + '"></iframe></div></div>';

    if ($('#chatContainer').length > 0) {
        close_chat($('#chatContainer').attr('chatroom_id'), $('#chatContainer').attr('invited_user_id'));
    }
    $('body').append(chatContainer);
}

function close_chat(chatroom_id, invited_user_id) {
    $('#chatContainer').remove();
    document.getElementById('contentFrame').contentWindow.postMessage("{\"closeChat\": \"" + chatroom_id + "\", \"invited_user_id\": \"" + invited_user_id + "\"}", "*");
    $('header').css({
        'position': 'fixed',
        'top': 0,
        'overflow': 'visible'
    });
    $('#infoBar').show();
}

function load_in_app_browser(url) {
    window.open(url, '_blank', 'location=yes');
    return false;
}

// URL parameter parsing

function get_args(url) {
    var args = [];
    var question = url.indexOf('?');

    if (question != -1) {
        var params = url.substring(question + 1).split('&');

        for (var i = 0; i < params.length; i++) {
            var pair = params[i].split('=');
            args[pair[0]] = pair[1];
        }
    }

    return args;
}

function inputFocusedActions() {
    console.log('input focused');
    if (!$('.searchHolder .dropDown').hasClass('dDownShow')) {
        $('header').css({
            'position': 'absolute',
            'top': 0,
            'overflow': 'hidden'
        });
    }
    $('#infoBar').hide();
    if (!navigator.userAgent.match(/Android/i) && parseFloat(window.device.version) >= 7.0) {
        setTimeout(function() {
            $('#chatContainer').css('bottom', -100)
        }, 100);
    }
}

function inputBlurredActions() {
    console.log('input blurred');
    $('header').css({
        'position': 'fixed',
        'top': 0,
        'overflow': 'visible'
    });
    $('#infoBar').css('position', 'static').show();
    setTimeout(function() {
        $('#infoBar').css('position', 'fixed')
    }, 50);
    $('#chatContainer').css('bottom', 40);
}

function call_for_messages(container, controller, data) {
    var holder = $(container).find('.dropDown ul');
    holder.html('').append('<div class="loader"></div>');
    messages_box_offset = 0;

    if (holder.find('li').length == 0) {
        document.getElementById('contentFrame').contentWindow.postMessage("{\"callForMessages\": \"1\", \"container\": \"" + container + "\", \"controller\": \"" + controller + "\", \"box_offset\": " + messages_box_offset + "}", "*");

        if (container == '.messagesHolder') {
            exec_scroll(holder, container, controller);
        } else if (container == '.notificationsHolder') {
            exec_scroll(holder, container, controller);
        }
    }

    //ajaxUpdateCounter(); should take care of this later
}

function ajax_call_for_messages(container, controller, data) {
    var holder = $(container).find('.dropDown ul');
    holder.find('.loader').remove();

    if (data.count == 0) {
        var empty_message = (controller == 'inbox' ? 'You have no messages in your inbox.' : 'You have no notifications.'); // translate
        holder.html('').append('<p align="center">' + empty_message + '</p>');
    } else if (data.count >= messages_box_offset) {
        for (var i = 0; i < data.messages.length; i++) {
            var from_forum = '<i class="rss" title="Forum"></i>';
            var message = data.messages[i];
            var forum = (message.forum ? message.forum : null);
            var html = '';

            html += '<li class="message-' + message.id + '">';
            html += '<a href="/' + controller + '/show?popup=true&' + (controller == 'inbox' ? 'message' : 'notification') + '=' + message.id + '"  onclick="return popup_clicked(this);">';
            html += '<span class="ms-image"><img src="' + schoolProtocol + '://' + schoolDomain + message.photo + '" width="30" height="30" alt="" /></span>';
            html += '<span class="ms-user">' + message.first_name + ' ' + message.last_name;
            html += (forum ? ' <span class="ms-arrow"></span> ' + forum : '');
            html += '</span>';
            html += '<span class="ms-subject">' + message.name + '</span>';

            if (message.read_at) {
                html += '<span class="ms-status"><i class="tick icnColor"></i></span>';
            } else {
                html += '<span class="ms-status"><i class="xCross icnColor"></i></span>';
            }

            html += '</a>';
            html += '</li>';

            holder.append(html);

            if (!message.read_at) {
                $('li.message-' + message.id + ' a').on('click', function() {
                    $(this).find('.ms-status').html('<i class="tick icnColor"></i>');

                    // change the newAlert counter value after unread message was opened
                    var newAlert = $(this).parents(container).find('.newAlert');
                    var messIcon = newAlert.next('i');

                    if (newAlert.length != 0) {
                        var newAlertValue = parseInt(newAlert.text());

                        if (newAlertValue > 1) {
                            newAlert.text(newAlertValue - 1);
                        } else {
                            messIcon.removeClass('messages').addClass('unread');
                            newAlert.remove();
                        }
                    }
                });
            }

        }

    }

    messages_box_offset += 10;
}

function exec_scroll(holder, container, controller) {
    $(container).find('.scroll').scroll(function(e) {
        if (e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight)) {
            document.getElementById('contentFrame').contentWindow.postMessage("{\"callForMessages\": \"1\", \"container\": \"" + container + "\", \"controller\": \"" + controller + "\", \"box_offset\": " + messages_box_offset + "}", "*");
        }
    });
}

function waitLoad(imgElm, data) {
    var editor = tinyMCE.activeEditor;

    function selectImage() {
        imgElm.onload = imgElm.onerror = null;
        editor.nodeChanged();
        editor.save();
        editor.windowManager.close();
    }
    imgElm.onload = function() {
        if (!data.width && !data.height) {
            dom.setAttribs(imgElm, {
                width: imgElm.clientWidth,
                height: imgElm.clientHeight
            });
        }
        selectImage();
        editor.isNotDirty = false;
    };
    imgElm.onerror = selectImage;
}

function hc_go_to_topic(element) {
    $(element).on('click', function(e) {
        e.preventDefault();
    });
    var link = $(element).attr('href').replace(schoolProtocol + '://' + schoolDomain, '');
    document.getElementById('contentFrame').contentWindow.postMessage("{\"hcGoToTopic\": \"" + link + "\"}", "*");
    document.getElementById('contentFrame').contentWindow.postMessage("{\"getHeader\": \"1\"}", "*");
}

function tabnav_adjustment(containerId) {
    if ($(containerId + ' ul.tabnav').length) {
        $(containerId + ' ul.tabnav').css('overflow', 'visible');
        if ($(containerId + ' ul.tabnav li.tabs_more_link .dropDown a').length > 0) {
            $(containerId + ' ul.tabnav li.tabs_more_link .dropDown a').wrap('<li></li>');
            $(containerId + ' ul.tabnav li.tabs_more_link .dropDown li').insertBefore(containerId + ' ul.tabnav li.tabs_more_link');
        }

        if ($(window).width() < 980 || $(containerId + ' ul.tabnav a.selected').parents('.dropDown').length > 0) {
            $(containerId + ' ul.tabnav a.selected').parent().prependTo(containerId + ' ul.tabnav');
        }

        $(containerId + ' ul.tabnav li:not(.tabs_more_link)').each(function() {
            if ($(this).offset().top > $(containerId + ' ul.tabnav li:first-child').offset().top) {
                $(this).appendTo(containerId + ' ul.tabnav .dropDown').find('a').unwrap();
                $(containerId + ' ul.tabnav li.tabs_more_link').css('display', 'inline-block');
            }
        });

        if ($(containerId + ' ul.tabnav li.tabs_more_link').length) {
            var i = 0;
            while (i < 5 && $(containerId + ' ul.tabnav li.tabs_more_link').offset().top > $(containerId + ' ul.tabnav li:first-child').offset().top) {
                $(containerId + ' ul.tabnav li.tabs_more_link').prev().prependTo(containerId + ' ul.tabnav .dropDown').find('a').unwrap();
                i++;
            }
        }

        if ($(containerId + ' ul.tabnav li.tabs_more_link .dropDown a').length == 0) {
            $(containerId + ' ul.tabnav li.tabs_more_link').css('display', 'none');
        }

        $(containerId + ' ul.tabnav .dropDownHolder > a').off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).siblings('.dropDown').toggleClass('dDownShow');
            $(this).toggleClass('highlight');
        });
    }
}

function notifications_animate(element) {
    var TimeOut;

    $(element).animate({
        height: 48
    }, 300);

    TimeOut = setTimeout(function() {
        $(element).animate({
            height: '0'
        }, 300, function() {
            $(this).remove();
            if ($('.notificationsPopUpHolder').find('> div > ul li').length == 0) {
                $('.notificationsPopUpHolder').find('.notificationsBottom').hide();
            }
        });
    }, 5000);

    $(element).mouseout(function() {
        TimeOut = setTimeout(function() {
            $(element).animate({
                height: '0'
            }, 300, function() {
                $(this).remove();
                if ($('.notificationsPopUpHolder').find('> div > ul li').length == 0) {
                    $('.notificationsPopUpHolder').find('.notificationsBottom').hide();
                }
            });
        }, 5000);
    });
}

function notification_mute() {
    var el = $('.audioNotifications');
    var enable = el.data('enable');

    document.getElementById('contentFrame').contentWindow.postMessage("{\"setNotificationSound\": \"" + enable + "\"}", "*");

    if (enable == true) {
        el.data('enable', false);
        el.find('i').removeClass('audioOff').addClass('audioOn');
    } else if (enable == false) {
        el.data('enable', true);
        el.find('i').removeClass('audioOn').addClass('audioOff');
    }
}

$(document).ready(function() {
    // Handles external messaging (API).
    window.addEventListener("message", function(event) {
        console.log('received message from ' + event.origin + ': ' + event.data);
        var data = JSON.parse(event.data);
        app.receiveExternalMessage(data, event.origin);
    });

    $(window).scroll(function() {
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            document.getElementById('contentFrame').contentWindow.postMessage("{\"moreNews\": \"1\"}", "*");
        }
        if (leftNavHeight > 0) {
            if ($(window).scrollTop() > leftNavHeight) {
                $('nav#leftColumn').fadeIn(200);
                document.getElementById('contentFrame').contentWindow.postMessage("{\"narrowLists\": \"1\"}", "*");
            } else if ($(window).scrollTop() <= leftNavHeight) {
                $('nav#leftColumn').fadeOut(100);
                document.getElementById('contentFrame').contentWindow.postMessage("{\"removeNarrowLists\": \"1\"}", "*");
            }
        }
        app.sendViewportData();
    });

    $('#arrowLeft, #arrowRight').on('touchstart', function() {
        $(this).addClass('inactive');
    });
    $('body').on('click', 'a[target="contentFrame"]', function(e) {
        e.preventDefault();
        if (typeof $(this).attr('onclick') == 'undefined' && !/void\(0\)/i.test($(this).attr('href'))) {
            app.toggleLoader(true);
            document.getElementById('contentFrame').src = $(this).attr('href');
        } else {
            $(window).scrollTop(0);
        }
    });

    if (navigator.userAgent.match(/Android/i)) {
        $('body').css('margin', 0);
        $('header').css('border', 'none');
    }

    $(window).resize(function() {
        if (($(window).height() == originalWidth && $(window).width() == originalHeight) || navigator.userAgent.match(/Android/i)) {
            $('body, #contentFrame, #loadingOverlay').css({
                width: $(window).width()
            });
            $('header').css('width', $(window).width());
            originalHeight = $(window).height();
            originalWidth = $(window).width();
        } else if (!navigator.userAgent.match(/Android/i)) {
            if ($(window).height() < (originalHeight - 50)) {
                console.log('window smaller');
                inputFocusedActions();
            } else {
                console.log('window larger');
                inputBlurredActions();
            }
        }

        if ($(window).width() > 980) {
            $("#user-menu").trigger("close.mm");
        }
    });

    $('body, #contentFrame, #loadingOverlay').css({
        width: $(window).width(),
        height: $(window).height() - (navigator.userAgent.match(/Android/i) ? 0 : 20)
    });
    $('header').css('width', $(window).width());

    $('.sendContent').click(function() {
        $('#infoBar').show();
        var editor = tinymce.activeEditor;
        document.getElementById('contentFrame').contentWindow.postMessage("{\"editorContent\": " + JSON.stringify(editor.getContent()) + "}", "*");
        console.log(JSON.stringify(editor.getContent()));
        $('.editorContainer').hide();
        editor.destroy();
    });
    
    var globalWindowHeight = $(window).height();
});
