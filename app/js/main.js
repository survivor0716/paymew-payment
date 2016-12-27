Zepto(function ($) {
  FastClick.attach(document.body);

  //var myParams = JSON.parse(window.localStorage.myParams);
  //var signPackage = myParams.signPackage;
  //var closeWeb = myParams.closeWeb;
  //var headImg = myParams.headImg;
  var package = null;
  var orderParams = {};

  //      $("#paymentAmount").on('change', function () {
  //        orderParams.total_fee = $(this).val();
  //        if(orderParams.total_fee) {
  //          orderParams.total_fee = toFixed2(orderParams.total_fee);
  //          $("#showAmount").html(orderParams.total_fee + '元 ');
  //          $("#payNow").removeAttr('disabled');
  //        } else {
  //          $("#showAmount").html('');
  //        }
  //      });
  var storeName = GetQueryString('name') || null,
      auth = GetQueryString('auth') || null,
      env = GetQueryString('env') || null,
      formalUrl = 'http://webserver.paymew.com/wechatpay/unifiedOrder',
      devUrl = 'http://webserver.dev.paymew.com/wechatpay/unifiedOrder',
      testUrl = 'http://webserver.test.paymew.com/wechatpay/unifiedOrder';

  var url;
  switch(env) {
    case 'TEST':
      url = testUrl;
      break;
    case 'DEV':
      url = devUrl;
      break;
    default:
      url = formalUrl;
  }

  $('title').html(storeName);
  var section = $('section');
  var footer = $('footer');
  section.find('.storeName').html(storeName);
  //if (headImg) {
  //  section.find('.headImg').css('background-image', 'url(' + headImg + ')');
  //}

  footer.on('click', '.btn1', function () {inputAmount('1');});
  footer.on('click', '.btn2', function () {inputAmount('2');});
  footer.on('click', '.btn3', function () {inputAmount('3');});
  footer.on('click', '.btn4', function () {inputAmount('4');});
  footer.on('click', '.btn5', function () {inputAmount('5');});
  footer.on('click', '.btn6', function () {inputAmount('6');});
  footer.on('click', '.btn7', function () {inputAmount('7');});
  footer.on('click', '.btn8', function () {inputAmount('8');});
  footer.on('click', '.btn9', function () {inputAmount('9');});
  footer.on('click', '.btn0', function () {inputAmount('0');});
  footer.on('click', '.btnDot', function () {inputAmount('.');});
  footer.on('click', '.btnDel', function () {inputDel();});

  var inputAmount = function (str) {
    console.time('输入金额');
    var currentAmount = section.find('#paymentAmount').html();
    if (currentAmount.indexOf('￥') !== -1)
      currentAmount = currentAmount.substring(1);

    if (currentAmount.indexOf('.') != -1) { //如果有 ‘.’
      if (str === '.') {  //输入 '.'
        return;
      }
      var tmp = currentAmount.split('.');
      console.log(tmp);
      if (tmp[1].length >= 2) //小数点后只留两位
        return;
    } else {  //如果没有 ‘.’
      if (currentAmount === '0' && str !== '.')  //第一位是'0', 再输入1-9
        currentAmount = '';
      if (str === '.' && !currentAmount.length) //未输入过
        str = '0.';
      if (currentAmount.length >= 4 && str != '.')  //最大不超过10000
        return;
    }
    section.find('#paymentAmount').html('￥' + currentAmount + str);
    console.timeEnd('输入金额');
    setOrderParams(currentAmount + str);
  };

  var inputDel = function () {
    console.time('输入金额');
    var currentAmount = section.find('#paymentAmount').html();
    if (currentAmount.indexOf('￥') !== -1)
      currentAmount = currentAmount.substring(1);

    if (currentAmount.length) {
      if (currentAmount.length == 1) {
        section.find('#paymentAmount').html('');
        console.timeEnd('输入金额');
        setOrderParams('');
      } else {
        section.find('#paymentAmount').html('￥' + currentAmount.substring(0, currentAmount.length - 1));
        console.timeEnd('输入金额');
        setOrderParams(currentAmount.substring(0, currentAmount.length - 1));
      }
    }
  };

  var setOrderParams = function (str) {
    orderParams.total_fee = parseFloat(str);
    if (orderParams.total_fee) {
      footer.find('#payNow').addClass('active').on('click', payNow);
    } else {
      footer.find('#payNow').removeClass('active').off();
    }
  };

  var request = null;

  function payNow() {
    console.log(request);
    if (request) {
      return;
    }
    request = $.ajax({
      url    : url + '/jsapi',
      type   : 'POST',
      data   : {
        auth: auth,
        total_fee: orderParams.total_fee
      },
      success: function (response) {
        var res = response;
        if (!res.errCode) {
          package = res.data;
          invokeWCPay();
        } else {
          alert('数据异常: ' + res.errMsg);
        }
      },
      error  : function (response, status, error) {
        request = null;
      }
    });
    console.log(request);
  }

  //获取地址栏参数
  function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
      return decodeURI(r[2]);
    }
    return null;
  }

  //    function toFixed2(num) {
  //      return Math.floor(num * 100) / 100;
  //    }

  function invokeWCPay() {
    if (typeof WeixinJSBridge === "undefined") {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    } else {
      onBridgeReady();
    }
  }

  function onBridgeReady() {
    WeixinJSBridge.invoke(
      'getBrandWCPayRequest', {
        "appId"    : package.appId,      //公众号名称，由商户传入
        "timeStamp": '' + package.timeStamp,  //时间戳，自1970年以来的秒数
        "nonceStr" : package.nonceStr,   //随机串
        "package"  : package.package,
        "signType" : package.signType,   //微信签名方式：
        "paySign"  : package.paySign     //微信签名
      },
      function (res) {
        if (res.err_msg === "get_brand_wcpay_request:ok") {
          window.location.href = 'http://h5.paymew.com/PaySuccess/';
        } // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
        else {
          //alert(res.err_msg);
        }
        request = null;
      }
    );
  }

  //wx.config({
  //  debug    : false,
  //  appId    : signPackage.appId,
  //  timestamp: parseInt(signPackage.timestamp),
  //  nonceStr : signPackage.nonceStr,
  //  signature: signPackage.signature,
  //  jsApiList: [
  //    // 所有要调用的 API 都要加到这个列表中
  //    "hideOptionMenu",
  //    "closeWindow"
  //  ]
  //});
  //wx.ready(function () {
    // 在这里调用 API
    //wx.hideOptionMenu();
    //if (closeWeb)
    //  wx.closeWindow();
  //});
});