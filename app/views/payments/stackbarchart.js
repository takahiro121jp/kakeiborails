/* 積み上げ棒グラフを作成 ver0.2
 * http://mimami24i.appspot.com/html5/stackbarchart
 * Canvasの座標には整数値を設定している。数値の整数化には~~演算子を使用
 * stackbar.Chartクラス使用方法詳細はReadmeを参照して下さい。
 * http://mimami24i.appspot.com/txt/stackbarchartReadme.txt
 */
var stackbar = {}; // namespace

/* 定数 */
stackbar.con = {
  msg: {  // 表示メッセージ
    smallarea1: 'データ量が多いため表示できません',
    smallarea2: 'Canvasサイズやクラスのプロパティを調整して下さい',
    chkerr1: '入力データ不正',
    chkerr2: 'dispErr()でエラー情報を取得できます'
  }
};

/* Array内要素の最大値を求める
 * ただしArrayの要素は数値限定
 * {Array} inArr 処理対象Array
 * return {number} 最大値の要素。引数が無ければ -Infinity。
 *        少なくとも1 つの引数が数に変換できなかった場合NaN
 *        inArrがArrayで無かった場合はnull
 */
stackbar.getmax = function(inArr) {
  if (!(inArr instanceof Array)) {
    return null;
  }
  return Math.max.apply(null,inArr);
};

/* Array内要素の合計値を求める
 * ただしArrayの要素は数値限定
 * {Array} inArr 処理対象Array
 * return {number} 合計値
 *        numberでないデータは0として計算
 *        inArrがArrayで無かった場合はnull
 */
stackbar.getsum = function(inArr) {
  if (!(inArr instanceof Array)) {
    return null;
  }
  var sumval = 0;
  for (var i = 0; i < inArr.length; i++) {
    sumval += (typeof inArr[i] == 'number') ? inArr[i] : 0;
  }
  return sumval;
};


/* 棒グラフクラス
 * {string} cvsId 表示対象canvasタグのid
 */
stackbar.Chart = function(cvsId) {
  var canvas = document.getElementById(cvsId);
  this.ctx = canvas.getContext('2d');
  this.width = this.ctx.canvas.width;
  this.height = this.ctx.canvas.height;
  this.errmsg = ''; // データチェック時のエラーメッセージ
  this.maxsum = 0;  // データ合計値の最大値
  this.titleHeight = 0; // タイトルエリアの高さ
  // 説明文エリア関連(他の値から動的に設定)
  this.expWidth = 0;  // 説明文エリアの幅
  this.expHeight = 0; // 説明文エリアの高さ
  this.expMargin = 0; // 説明文エリア上余白
  this.expMdlMargin = 0; // 説明文間上下余白
  this.expUnitHeight = 0;  // 説明文1行の高さ
  this.expGap = 0;  // 説明文要素間の余白
  this.expCGap = 0; // 色表示ボックスと説明文間の余白
  this.expColWidth = 0; // 色表示ボックスの幅
  // canvas context の初期値設定
  this.ctx.lineCap = 'round';
  this.ctx.globalCompositeOperation = 'source-over';
  // SizeFactor設定
  // 400px × 400px のエリアを想定
  this.widthSizeFactor = this.width/400;
  this.heightSizeFactor = this.height/400;

  /* 以下、ライブラリ使用者が設定可能なプロパティ
   * 詳細はReadmeを参照
   */
  // データ関連
  this.data = []; // データ配列を格納する配列
  this.labels = []; // データ配列の見出し
  this.dataexp = []; // データ配列各要素の説明

  // グラフ関連
  this.title = null;  // グラフのタイトル
  this.VerticalBar = false;  // 縦棒グラフを表示する場合true
  this.barFillStyle = '#dc2400';
  this.color = ['#feb69e', '#fe835a', '#fe5016', '#7de9aa', '#43df84', '#20be62', '#82c5ff', '#3ea6ff', '#0086f9', '#aaaaaa', '#888888'];

  // 各種サイズをcanvasのサイズに合わせる場合true
  this.proportionalSizes = true;

  // 余白関連
  this.marginTop = 10;
  this.marginBottom = 10;
  this.marginLeft = 10;
  this.marginRight = 10;
  this.labelMargin = 5;
  this.titleMargin = 10;
  this.dataValueMargin = 3;
  this.barGap = 18;

  // データ配列の見出し関連
  this.labelFillStyle = '#dc2400';
  this.labelFont = '"ＭＳ Ｐゴシック", "Osaka", sans-serif';
  this.labelFontHeight = 14;
  this.labelFontStyle = 'bold';

  // データ値表示関連
  this.dataValueFillStyle = '#333333';
  this.dataValueFont = '"ＭＳ Ｐゴシック", "Osaka", sans-serif';
  this.dataValueFontHeight = 12;
  this.dataValueFontStyle = '';

  // タイトル関連
  this.titleFillStyle = '#333333';
  this.titleFont = '"ＭＳ Ｐゴシック", "Osaka", sans-serif';
  this.titleFontHeight = 16;
  this.titleFontStyle = 'bold';

  // データ説明文関連
  this.showexp = true;  // データ要素の説明文を表示する場合true
  this.expFillStyle = '#333333';
  this.expFont = '"ＭＳ Ｐゴシック", "Osaka", sans-serif';
  this.expFontHeight = 14;
  this.expFontStyle = '';

};
/* グラフを表示する
 * return なし
 */
stackbar.Chart.prototype.draw = function() {
  var context = this.ctx;
  var datanum = this.data.length;  // データ配列の個数

  // 各種サイズをcanvasのサイズに合わせて調整
  if (this.proportionalSizes) {
    var minFactor = Math.min(this.widthSizeFactor, this.heightSizeFactor);
    if (this.VerticalBar) { // 縦棒の場合
      this.labelMargin = ~~(this.labelMargin * this.heightSizeFactor);
      this.barGap = ~~(this.barGap * this.widthSizeFactor);
    } else {  // 横棒の場合
      this.labelMargin = ~~(this.labelMargin * this.widthSizeFactor);
      this.barGap = ~~(this.barGap * this.heightSizeFactor);
    }
    this.dataValueMargin = ~~(this.dataValueMargin * this.widthSizeFactor);
    this.titleMargin = ~~(this.titleMargin * this.heightSizeFactor);
    this.labelFontHeight = ~~(this.labelFontHeight * minFactor);
    this.dataValueFontHeight = ~~(this.dataValueFontHeight * minFactor);
    this.titleFontHeight = ~~(this.titleFontHeight * minFactor);
    this.expFontHeight = ~~(this.expFontHeight * minFactor);
  }

  // データチェック
  this.errmsg = '';
  if (!this.datachk()) {
    // Canvasにエラーの旨表示
    var msgArr = [];
    msgArr.push(stackbar.con.msg.chkerr1);
    msgArr.push(stackbar.con.msg.chkerr2);
    this.dispMsg(msgArr);
    return false;
  }

  // 縦棒の場合、marginLeft, marginRightを少し広げる
  if (this.VerticalBar) {
    this.marginLeft = ~~(this.marginLeft + this.barGap / 2);
    this.marginRight = ~~(this.marginRight + this.barGap / 2);
  }

  // 各データ配列のデータ合計値を求める
  var sumArr = []; // データ合計値
  this.maxsum = 0;
  for (var i = 0; i < datanum; i++) {
    sumArr[i] = stackbar.getsum(this.data[i]);
  }
  this.maxsum = stackbar.getmax(sumArr);

  // タイトルエリアの高さを求める
  var titleFontHeight = 0; // フォントサイズ
  var titleLimit = ~~(this.width - this.marginLeft -
      this.marginRight);  // タイトル表示幅上限
  if (this.title) {
    var titleWidth = 0; // 表示幅
    thisStr = String(this.title);  // 出力対象文字列
    titleFontHeight = this.titleFontHeight;
    context.font = this.titleFontStyle + ' ' + titleFontHeight + 'px ' +
        this.titleFont;
    titleWidth = context.measureText(thisStr).width;
    if (titleWidth > titleLimit) {
      for (var fi = 0; titleFontHeight > 6; fi++) {
        titleFontHeight -= 2;
        context.font = this.titleFontStyle + ' ' + titleFontHeight + 'px ' +
            this.titleFont;
        titleWidth = context.measureText(thisStr).width;
        if (titleWidth < titleLimit) {
          break;
        }
      }
    }
    this.titleHeight = titleFontHeight + this.titleMargin;
  }

  // 説明文エリアのサイズを求める
  var expTempWidth = 0; // 横幅計算用
  var expUnitWidth = 0; // 説明文1要素の幅
  if (this.VerticalBar) { // 縦棒の場合
    this.expMargin = ~~(this.labelMargin * 3);
    this.expGap = ~~(this.barGap / 2);
  } else {  // 横棒の場合
    this.expMargin = ~~this.barGap;
    this.expGap = ~~(this.labelMargin * 2);
  }
  this.expMdlMargin = ~~(this.expMargin / 2.5);
  this.expCGap = ~~(this.expGap / 2);
  if (this.showexp && this.dataexp.length > 0) {
    context.font = this.expFontStyle + ' ' + this.expFontHeight + 'px ' +
        this.expFont;
    this.expUnitHeight = ~~(this.expFontHeight * 1.2);
    this.expColWidth = ~~(this.expUnitHeight * 1.5);
    this.expWidth = this.width - this.marginLeft - this.marginRight;
    this.expHeight += this.expMargin;
    for (var i = 0; i < this.dataexp.length; i++) {
      expUnitWidth = this.expColWidth +this.expCGap +
          context.measureText(String(this.dataexp[i])).width + this.expGap;
      if (expUnitWidth > this.expWidth) {
        // 説明文一つの横幅が表示領域いっぱいの場合
        if (expTempWidth > 0) {
          this.expHeight += this.expUnitHeight + this.expMdlMargin;
        }
        this.expHeight += this.expUnitHeight + this.expMdlMargin;
        expTempWidth = 0;
      } else {
        expTempWidth += expUnitWidth;
        if (expTempWidth > this.expWidth ) {
          this.expHeight += this.expUnitHeight + this.expMdlMargin;
          expTempWidth = expUnitWidth;
        }
      }
    }
    if (expTempWidth > 0) {
      // 最後の行の高さを追加
      this.expHeight += this.expUnitHeight + this.expMdlMargin;
    }
    // 一番下のMarginを削除
    this.expHeight -= this.expMdlMargin;
  }

  var drawrtn = true;
  if (this.VerticalBar) {
    // 縦棒グラフを表示する
    drawrtn = this.drawVerticalBarChart();
  } else {
    // 横棒グラフを表示する
    drawrtn = this.drawBarChart();
  }
  if (!drawrtn) {
    // グラフ表示でエラー発生
    return false;
  }

  // タイトルを描く
  if (this.title) {
    var tx = ~~(this.width / 2);
    var ty = ~~(this.marginTop + titleFontHeight / 2);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = this.titleFontStyle + ' ' + titleFontHeight + 'px ' +
        this.titleFont;
    context.fillStyle = this.titleFillStyle;
    context.fillText(this.title, tx, ty, titleLimit);
  }

};

/* 横棒グラフを表示する
 * return {boolean} 正常に表示出来た場合はtrue それ以外はfalse
 */
stackbar.Chart.prototype.drawBarChart = function() {
  var context = this.ctx;
  var datanum = this.data.length;  // データ配列の個数
  var isFirefox = navigator.userAgent.match(/firefox/i); // ブラウザがFirefoxか

  // 見出しの横幅を求める
  context.font = this.labelFontStyle + ' ' + this.labelFontHeight + 'px ' +
      this.labelFont;
  var maxLabelWidth = 0;
  var labelLimit = ~~((this.width - this.marginLeft - this.marginRight) /
       3);  // 見出し横幅上限
  var labelWidth = 0;
  for (var i = 0; i < datanum; i++) {
    labelWidth = context.measureText(String(this.labels[i])).width;
    if (labelWidth > labelLimit) {
      // FirefoxはfillTextのmaxWidthに対応しているので、少し余裕をもたせる
      if (isFirefox && labelWidth < labelLimit * 1.5) {
        labelWidth = labelLimit;
      } else {
        this.labels[i] = '';
        labelWidth = 0;
      }
    }
    if (labelWidth > maxLabelWidth) {
      maxLabelWidth = labelWidth;
    }
  }
  maxLabelWidth = ~~maxLabelWidth;

  // 棒の太さを求める
  var barHeight = ~~((this.height - this.marginTop - this.marginBottom - 
      this.titleHeight - this.expHeight -
      (datanum - 1) * this.barGap) / datanum);
  if (barHeight <= 0) {
    // データ表示領域が小さいため表示不可
    var msgArr = [];
    msgArr.push(stackbar.con.msg.smallarea1);
    msgArr.push(stackbar.con.msg.smallarea2);
    this.dispMsg(msgArr);
    return false;
  }
  var barHeightHf = ~~(barHeight / 2);

  var barBottomX = this.marginLeft + maxLabelWidth + this.labelMargin;
  var barMaxTopX = this.width - this.marginRight;

  // 棒の長さを求める
  // (データがマイナスのケースは考慮しない) 
  var maxbarWidth = barMaxTopX - barBottomX;
  var barunit = maxbarWidth / this.maxsum; // 単位データ量あたりのグラフの長さ
  var x0 = ~~barBottomX;  // x座標初期値
  var x = x0;   // Canvas上のx座標
  var y = ~~(this.marginTop + this.titleHeight); // Canvas上のy座標
  var barWidth = 0; // 棒の長さ

  context.fillStyle = this.barFillStyle;
  context.textBaseline = 'middle';
  
  var thisval = 0;  // 処理対象データ値
  var colidx = 0; // グラフ色配列のindex
  var dataValueWidth = 0; // データ値表示幅
  var maxdataValueWidth = 0; // データ値表示幅最大値
  var dataValueLimit = 0; // データ値表示幅上限
  var thisvalstr = ''; // 処理対象データ値の文字列
  for (var i = 0; i < datanum; i++) {
    // 棒を描く
    colidx = 0;
    x = x0;
    context.textAlign = 'center';
    context.font = this.dataValueFontStyle + ' ' + this.dataValueFontHeight +
        'px '+ this.dataValueFont;
    for (var di = 0; di < this.data[i].length; di++) {
      thisval = this.data[i][di];
      barWidth = ~~(thisval * barunit);
      
      context.fillStyle = this.color[colidx];
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + barWidth, y);
      context.lineTo(x + barWidth, y + barHeight);
      context.lineTo(x, y + barHeight);
      context.fill();

      // データの値を描く
      context.fillStyle = this.dataValueFillStyle;
      thisvalstr = String(thisval);
      maxdataValueWidth = ~~(barWidth - this.dataValueMargin * 2);
      dataValueLimit = maxdataValueWidth;
      // FirefoxはfillTextのmaxWidthに対応しているので、
      // dataValueLimitをちょっと伸ばす
      if (isFirefox) {
        dataValueLimit *= 1.5;
      }
      dataValueWidth = context.measureText(thisvalstr).width;
      if (dataValueWidth < dataValueLimit) {
        context.fillText(thisvalstr, ~~(x + barWidth / 2), y + barHeightHf,
            maxdataValueWidth);
      }

      x += barWidth;
      colidx++;
      if (colidx >= this.color.length) {
        colidx = 0;
      }
    }
    // 見出しを描く
    context.textAlign = 'left';
    context.font = this.labelFontStyle + ' ' + this.labelFontHeight + 'px '+
        this.labelFont;
    context.fillStyle = this.labelFillStyle;
    context.fillText(this.labels[i], this.marginLeft, y + barHeightHf,
        maxLabelWidth);

    y += barHeight + this.barGap;
  }

  // 説明文エリアを描く
  if (this.showexp) {
    x = ~~this.marginLeft;
    // y座標から最後に付加したbarGapを引き、expMarginを加える
    y += this.expMargin - this.barGap;
    this.drawExp(x, y);
  }
  return true;
};

/* 縦棒グラフを表示する
 * return {boolean} 正常に表示出来た場合はtrue それ以外はfalse
 */
stackbar.Chart.prototype.drawVerticalBarChart = function() {
  var context = this.ctx;
  var datanum = this.data.length;  // データ配列の個数

  // 棒の太さを求める
  var barWidth = ~~((this.width - this.marginLeft - this.marginRight - 
      (datanum - 1) * this.barGap) / datanum);
  if (barWidth <= 0) {
    // データ表示領域が小さいため表示不可
    var msgArr = [];
    msgArr.push(stackbar.con.msg.smallarea1);
    msgArr.push(stackbar.con.msg.smallarea2);
    this.dispMsg(msgArr);
    return false;
  }
  var barWidthHf = ~~(barWidth / 2);

  var barBottomY = ~~(this.height - this.marginBottom - this.expHeight -
      this.labelFontHeight - this.labelMargin);
  var barMaxTopY = ~~(this.marginTop + this.titleHeight);
  var maxLabelWidth = ~~(barWidth + this.barGap * 0.8); // 見出し横幅の最大値
  var labelLimit = maxLabelWidth; // 見出し横幅上限
  // FirefoxはfillTextのmaxWidthに対応しているので、
  // labelLimitをちょっと伸ばす
  var isFirefox = navigator.userAgent.match(/firefox/i); // ブラウザがFirefoxか
  if (isFirefox) {
    labelLimit *= 1.5;
  }

  // 棒の長さを求める
  // (データがマイナスのケースは考慮しない) 
  var maxbarHeight = barBottomY - barMaxTopY;
  var barunit = maxbarHeight / this.maxsum; // 単位データ量あたりのグラフの長さ
  var y0 = ~~barBottomY;  // y座標初期値
  var x = this.marginLeft;   // Canvas上のx座標
  var y = y0; // Canvas上のy座標
  var barHeight = 0; // 棒の長さ

  context.fillStyle = this.barFillStyle;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  var thisval = 0;  // 処理対象データ値
  var colidx = 0; // グラフ色配列のindex
  var labelMiddleY = ~~(this.height - this.marginBottom - this.expHeight -
    this.labelFontHeight / 2);  // 見出し表示位置Y座標
  var dataValueWidth = 0; // データ値表示幅
  var labelWidth = 0; // 見出し表示幅
  // データ値表示幅上限
  //var dataValueLimit = barWidth - this.dataValueMargin * 2;
  var dataValueLimit = labelLimit;
  if (dataValueLimit < this.dataValueMargin) {
    dataValueLimit = 0;
  }
  var thisvalstr = ''; // 処理対象データ値の文字列
  var labelstr = '';  // 見出しの文字列
  var dataValueFontHeight = 0;  // データ値のフォントサイズ
  for (var i = 0; i < datanum; i++) {
    // 棒を描く
    colidx = 0;
    y = y0;
    for (var di = 0; di < this.data[i].length; di++) {
      thisval = this.data[i][di];
      barHeight = ~~(thisval * barunit);
      
      context.fillStyle = this.color[colidx];
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + barWidth, y);
      context.lineTo(x + barWidth, y - barHeight);
      context.lineTo(x, y - barHeight);
      context.fill();

      // データの値を描く
      if (dataValueLimit > 0) {
        thisvalstr = String(thisval);
        dataValueFontHeight = 0;
        if (barHeight > this.dataValueFontHeight) {
          dataValueFontHeight = this.dataValueFontHeight;
        } else if (barHeight > (this.dataValueFontHeight / 1.5)) {
          dataValueFontHeight = barHeight;
        }
        if (dataValueLimit > 0 && dataValueFontHeight > 0) {
          context.font = this.dataValueFontStyle + ' ' +
              dataValueFontHeight + 'px '+ this.dataValueFont;
          dataValueWidth = context.measureText(thisvalstr).width;
          if (dataValueWidth < dataValueLimit) {
            context.fillStyle = this.dataValueFillStyle;
            context.fillText(thisvalstr, x + barWidthHf,
                ~~(y - barHeight / 2), maxLabelWidth);
          }
        }
      }

      y -= barHeight;
      colidx++;
      if (colidx >= this.color.length) {
        colidx = 0;
      }
    }
    // 見出しを描く
    context.font = this.labelFontStyle + ' ' + this.labelFontHeight + 'px '+
        this.labelFont;
    labelstr = String(this.labels[i]);
    labelWidth = context.measureText(labelstr).width;
    if (labelWidth < labelLimit) {
      context.fillStyle = this.labelFillStyle;
      context.fillText(labelstr, x + barWidthHf, labelMiddleY,
          maxLabelWidth);
    }
    
    x += barWidth + this.barGap;
  }

  // 説明文エリアを描く
  if (this.showexp) {
    x = this.marginLeft;
    y = ~~(this.height - this.marginBottom - this.expHeight + this.expMargin);
    this.drawExp(x, y);
  }
  return true;
};

/* 説明文エリアを表示する
 * {int} x 説明文エリア左上のCanvas上x座標
 * {int} y 説明文エリア左上のCanvas上y座標
 * return なし
 */
stackbar.Chart.prototype.drawExp = function(x, y) {
  var context = this.ctx;
  var colidx = 0; // グラフ色配列のindex
  context.textAlign = 'left';
  var expUnitHeightHf = ~~(this.expUnitHeight / 2);
  var expLimit = this.marginLeft + this.expWidth;  // x座標の上限
  var expStrLimit = this.expWidth - this.expColWidth -
      this.expCGap; // 文字列サイズの上限
  var expTempWidth = 0; // 横幅計算用
  var expStrWidth = 0;  // 説明文文字列の幅
  var tempFontHeight = 0; // 暫定フォントサイズ
  var thisStr;  // 出力対象文字列
  for (var i = 0; i < this.dataexp.length; i++) {
    // 表示予定の幅を求める
    context.font = this.expFontStyle + ' ' + this.expFontHeight + 'px '+
        this.expFont;
    thisStr = String(this.dataexp[i]);
    expStrWidth = context.measureText(thisStr).width;
    expTempWidth = this.expColWidth + this.expCGap + expStrWidth +
        this.expGap;
    if ((x + expTempWidth) > expLimit && x > this.marginLeft) {
      x = this.marginLeft;
      y += this.expMdlMargin + this.expUnitHeight;
    }
    // グラフ色ボックス表示
    context.fillStyle = this.color[colidx];
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + this.expColWidth, y);
    context.lineTo(x + this.expColWidth, y + this.expUnitHeight);
    context.lineTo(x, y + this.expUnitHeight);
    context.fill();

    // 説明文表示
    x += this.expColWidth + this.expCGap;
    tempFontHeight = this.expFontHeight;
    if (expStrWidth > expStrLimit) {
      for (var fi = 0; tempFontHeight > 6; fi++) {
        tempFontHeight -= 2;
        context.font = this.expFontStyle + ' ' + tempFontHeight + 'px ' +
            this.expFont;
        expStrWidth = context.measureText(thisStr).width;
        if (expStrWidth < expStrLimit) {
          break;
        }
      }
    }
    context.fillStyle = this.expFillStyle;
    context.fillText(this.dataexp[i], x, y + expUnitHeightHf, expStrLimit);
    x += expStrWidth + this.expGap;
    if (x > expLimit) {
      // 説明文表示後のyの値を揃えるための判定
      if ((i + 1) < this.dataexp.length) {
        x = this.marginLeft;
        y += this.expMdlMargin + this.expUnitHeight;
      }
    }

    colidx++;
    if (colidx >= this.color.length) {
      colidx = 0;
    }
  }
};

/* データチェック
 * エラーメッセージをthis.errmsgへ格納
 * return 正常データの場合はtrue。それ以外の場合はfalse
 */
stackbar.Chart.prototype.datachk = function() {
  this.errmsg = '';
  var dataArrNum = this.data.length;  // データ配列の個数
  if (dataArrNum == 0) {
    this.errmsg += 'no data<br>';
    return false;
  }
  var dataElmNum = this.data[0].length; // データ要素の個数
  // データ要素の個数チェック
  var thisElmNum = 0;
  for (var i = 1; i < dataArrNum; i++) {
    thisElmNum = this.data[i].length;
    if (thisElmNum != dataElmNum) {
      this.errmsg += 'data[' + i + ']=' + thisElmNum + 
          ' not equal data[0].length' + dataElmNum + '<br>';
    }
  }
  // データ要素がnumberかチェック
  for (var i = 0; i < dataArrNum; i++) {
    for (var di = 0; di < this.data[i].length; di++) {
      if (typeof this.data[i][di] != 'number') {
        this.errmsg += 'data[' + i + '][' + di + ']=' +  this.data[i][di] +
            ' not number' + '<br>';
      } else if (this.data[i][di] < 0) {
        this.errmsg += 'data[' + i + '][' + di + ']=' +  this.data[i][di] +
            ' &lt;0<br>';
      }
    }
  }
  // 見出しや説明文の個数チェック
  if (this.labels.length != dataArrNum) {
    this.errmsg += 'labels.length=' + this.labels.length +
        ' not equal data.length ' + dataArrNum + '<br>';
  }
  if (this.dataexp.length != dataElmNum && this.dataexp.length > 0) {
    this.errmsg += 'dataexp.length=' + this.dataexp.length +
        ' not equal data.length ' + dataArrNum + '<br>';
  }
  if (this.errmsg != '') {
      return false;
  }
  return true;
};

/* エラーメッセージhtml取得
 * return データチェック結果のエラーメッセージ。エラーが無い場合は ''
 */
stackbar.Chart.prototype.dispErr = function() {
  return this.errmsg;
};

/* Canvasにメッセージ表示
 * {Array} msgArr 表示するメッセージStringを格納した配列
 * return なし
 */
stackbar.Chart.prototype.dispMsg = function(msgArr) {
  var context = this.ctx;
  var msgnum = msgArr.length;  // メッセージ配列の個数
  // 各メッセージのfontSize
  // fillTextのmaxLengthをサポートしていないブラウザ用
  var fontSizeArr = [];
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = this.labelFillStyle;
  var thisFontStyle = 'bold';
  var thisFontHeight = ~~(this.labelFontHeight * 1.5);

  var msgWidth = 0; // メッセージの幅
  var maxMsgWidth = 0; // メッセージの幅の最大値
  var msgWidthLimit = this.width - this.marginLeft -
      this.marginRight; // メッセージ表示幅上限
  var tempFontHeight = 0; // 暫定フォントサイズ
  var thisStr;  // 出力対象文字列
  for (var i = 0; i < msgnum; i++) {
    thisStr = String(msgArr[i]);
    tempFontHeight = thisFontHeight;
    context.font = thisFontStyle + ' ' + thisFontHeight + 'px ' +
        this.labelFont;
    msgWidth = context.measureText(thisStr).width;
    if (msgWidth > msgWidthLimit) {
      for (var fi = 0; tempFontHeight > 6; fi++) {
        tempFontHeight -= 2;
        context.font = thisFontStyle + ' ' + tempFontHeight + 'px ' +
            this.labelFont;
        msgWidth = context.measureText(thisStr).width;
        if (msgWidth < msgWidthLimit) {
          break;
        }
      }
      fontSizeArr[i] = tempFontHeight;
    } else {
      fontSizeArr[i] = thisFontHeight;
    }
    if (msgWidth > maxMsgWidth) {
      maxMsgWidth = msgWidth;
    }
  }

  var mx, my; // Canvas上の座標
  mx = ~~((this.width - maxMsgWidth) / 2);
  if (mx < this.marginLeft) {
    mx = ~~this.marginLeft;
  }
  // 中央よりちょっと上寄りに表示させるため、2.5で割る
  var my = ~~((this.height - thisFontHeight * msgnum -
      (msgnum - 1) * this.barGap) / 2.5);
  if (my < this.marginTop) {
    my = ~~this.marginTop;
  }
  
  // メッセージ表示
  for (var i = 0; i < msgnum; i++) {
    context.font = thisFontStyle + ' ' + fontSizeArr[i] + 'px ' +
        this.labelFont;
    context.fillText(msgArr[i], mx, my, msgWidthLimit);
    my += thisFontHeight + this.barGap;
  }
};

