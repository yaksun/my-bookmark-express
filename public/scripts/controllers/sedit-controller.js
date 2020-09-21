app.controller('seditCtr', ['$scope', '$state', '$timeout', '$document', 'ngDialog', 'bookmarkService', 'pubSubService', 'dataService', function($scope, $state, $timeout, $document, ngDialog, bookmarkService, pubSubService, dataService) {
    console.log("Hello seditCtr");
    var maxSelections = 3;
    var dialog = null;
    var cancelDefault = false;
    init();

    $scope.$watch('search_url', function(newUrl, oldUrl, scope) {
        $timeout(function() {
            $scope.urlError = $scope.search_url == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    
    });

    $scope.$watch('title', function(newValue, oldValue, scope) {
        $timeout(function() {
            $scope.titleError = $scope.title == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    });

    
    $scope.$watch('quick_key', function(newValue, oldValue, scope) {
        $timeout(function() {
            $scope.quickKeyError = $scope.quick_key == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    });

      
    $scope.$watch('icon_class', function(newValue, oldValue, scope) {
        $timeout(function() {
            $scope.iconClassError = $scope.icon_class == '' && $('.ui.modal.js-add-searchUrl').modal('is active');
        });
    });

    $scope.restoreTitle = function() {
        $scope.title = $scope.originTitle;
    }

    $scope.cancel = function() {
        $('.ui.modal.js-add-searchUrl').modal('hide');

        init();
    }
    $scope.ok = function() {
      
        // console.log('Hello ok clicked', $scope.url, $scope.title, $scope.description, $scope.public, selectedTags, $scope.tags);
        $scope.urlError = $scope.search_url == '';
        $scope.titleError = $scope.title == '';
        $scope.quickKeyError = $scope.quick_key == '';
        $scope.iconClassError = $scope.icon_class == '';
        var params = {
            id: $scope.id,
            url: $scope.search_url,
            title: $scope.title,
            quick_key: $scope.quick_key,
            icon_class: $scope.icon_class,
            public: $('.ui.checkbox.js-public').checkbox('is checked') ? '1' : '0',
        }
     
        if ($scope.titleError) {
            toastr.error('书签标题不能为空！', "错误");
            return;
        }
        console.log("add bookmark", params);
        if ($scope.add) {
            bookmarkService.addBookmark(params)
                .then((data) => {
                    $('.ui.modal.js-add-searchUrl').modal('hide');
                    pubSubService.publish('EditCtr.inserBookmarsSuccess', data);
                    if (data.title) {
                        toastr.success('[ ' + data.title + ' ] 添加成功，将自动重新更新书签！</br>' + (data.update ? '系统检测到该书签之前添加过，只更新链接，描述，标题，分类。创建日期与最后点击日期不更新！' : ''), "提示");
                    } else {
                        toastr.error('[ ' + params.title + ' ] 添加失败', "提示");
                    }
                })
                .catch((err) => {
                    console.log('addBookmark err', err);
                    toastr.error('[ ' + params.title + ' ] 添加失败' + JSON.stringify(err), "提示");
                });
        } else {
            bookmarkService.updateSearchUrl(params)
                .then((data) => {
                    $('.ui.modal.js-add-searchUrl').modal('hide');
                    pubSubService.publish('SeditCtr.inserBookmarsSuccess', data);
                    toastr.success('[ ' + params.title + ' ] 更新成功，将自动重新更新书签！', "提示");
                })
                .catch((err) => {
                    console.log('updateBookmark err', err);
                    toastr.error('[ ' + params.title + ' ] 更新失败' + JSON.stringify(err), "提示");
                });
        }
    }



    pubSubService.subscribe('bookmarksCtr.editSearchUrl', $scope, function(event, params) {
        console.log('subscribe bookmarksCtr.editSearchUrl', params);
        $('.ui.modal.js-add-searchUrl').modal({
            closable: false,
        }).modal('setting', 'transition', dataService.animation()).modal('show');
        setTimeout(function() {
            $('.ui.modal.js-add-searchUrl').modal("refresh");
        }, 500);
        $scope.add = false;
        $scope.loadTags = true;
        cancelDefault = false;
                var bookmark = params.param;
                $scope.autoGettitle = false;
                $scope.id = (bookmark && bookmark.id) || '';
                $scope.search_url = (bookmark && bookmark.search_url) || '';
                $scope.title = (bookmark && bookmark.title) || '';
                $scope.icon_class = (bookmark && bookmark.icon_class) || '';
                $scope.quick_key = (bookmark && bookmark.quick_key) || '';
               
                $scope.public = (bookmark && bookmark.id) || '1';
                $('.ui.checkbox.js-public').checkbox((bookmark && bookmark.public && bookmark.public == '1') ? 'set checked' : 'set unchecked')

    });


    // 在输入文字的时候也会触发，所以不要用Ctrl,Shift之类的按键
    $document.bind("keydown", function(event) {
        $scope.$apply(function() {
            var menusScope = $('div[ng-controller="menuCtr"]').scope();
            var key = event.key.toUpperCase();
            // console.log(key);
            if (key == 'INSERT' && menusScope.login) {
                if ($('.ui.modal.js-add-bookmark').modal('is active')) {
                    $scope.ok();
                } else {
                    $('.ui.modal.js-add-bookmark').modal({
                        closable: false,
                    }).modal('setting', 'transition', dataService.animation()).modal('show');
                    $('.ui.checkbox.js-public').checkbox('set checked');
                    cancelDefault = true;
                    init();
                }
            }

            // Esc按键，退出
            if (key == 'ESCAPE' && menusScope.login) {
                $scope.cancel();
            }
        })
    });

    function init() {
        $scope.add = true;
        $scope.loadTags = true;
        $scope.autoGettitle = true;
        $scope.loadTitle = false;
        $scope.id = '';
        $scope.search_url = '';
        $scope.title = '';
        $scope.icon_class = '';
        $scope.quick_key = '';

        $scope.urlError = false;
        $scope.titleError = false;
        $scope.titleError = false;
        $scope.titleError = false;

        $scope.public = '1';
    }
}]);
