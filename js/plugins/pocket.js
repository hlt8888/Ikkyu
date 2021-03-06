define(function(require, exports, module) {
    var Auth = require('../common/auth');
    var conf = require('../conf/pocket_conf');
    var auth = new Auth(conf);

    function handler(results) {
        var ret = {};

        ret.request_token = results.split('=')[1];
        return ret;
    }

    var ajax;
    var pocketIcon = 'http://getpocket.com/i/apple-touch-icon/Pocket_AppIcon_57.png';

    function createItem(index, item) {
        var title = item.given_title || item.resolved_title || item.excerpt;

        return [
            '<div data-type="pocket" data-id="' + item.id + '" data-index="' + index + '" class="ec-item">',
            '<img class="ec-item-icon" src="' + pocketIcon + '" alt="" />',
            '<span class="ec-item-name">' + title + '</span>',
            '</div>'
        ];
    }

    function onInput(key) {
        if (!key && !auth.isAuthenticated()) {
            auth.authenticate(handler);

            return;
        }

        var cmdbox = this;

        query(key, function(data) {
            cmdbox.showItemList(data);
        });
    }

    function query(key, callback) {
        if (ajax) {
            ajax.abort();
        }
        var params = {
            consumer_key: auth.consumer_key,
            access_token: auth.get(auth.accessTokenName)
        };

        if (key) {
            $.extend(params, {
                search: key,
                state: 'all'
            });
        }

        ajax = $.post('https://getpocket.com/v3/get', params, function(data) {
            if (data.list) {
                var list = [];
                for (var i in data.list) {
                    var item = data.list[i];

                    item.id = i;
                    list.push(item);
                }
                callback(list);
            }
        });
    }

    function onEnter(id, elem) {
        window.open('http://getpocket.com/a/read/' + id);
    }

    module.exports = {
        onInput: onInput,
        onEnter: onEnter,
        createItem: createItem
    };
});