!function(){"use strict";(window.WPCodeAdminWideNotices||function(i,e,c){var n={init:function(){c(n.ready)},ready:function(){n.events()},events:function(){c(i).on("click",".wpcode-notice .notice-dismiss, .wpcode-notice .wpcode-notice-dismiss",n.dismissNotice)},dismissNotice:function(i){i.target.classList.contains("wpcode-notice-dismiss")&&c(this).closest(".wpcode-notice").slideUp(),c.post(wpcode_admin_notices.ajax_url,{action:"wpcode_notice_dismiss",_wpnonce:wpcode_admin_notices.nonce,id:(c(this).closest(".wpcode-notice").attr("id")||"").replace("wpcode-notice-","")})}};return n}(document,window,jQuery)).init()}();