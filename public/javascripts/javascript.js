/*global $*/
var fetchEsi = (url, cb) => {
    if (!url) cb(new Error('No URL'));
    $.ajax(url, {
        success: (data) => {
            cb(null, data);
        },
        fail: (error) => {
            cb(error);
        }
    });
};

$('[role=esi]').each((i, el) => {
    var $el = $(el);
    var url = $el.attr('href');
    fetchEsi(url, (err, html) => {
        if (!err) {
            $el.replaceWith(html);
        }
    });
});
