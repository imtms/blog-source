title: DHL用自己的check digits规范把我坑了一下
categories: By TMs
tags: [php]
date: 2015-05-06 00:23:00
---

这几天一直在搞条形码生成。因为有一个和DHL的合作项目要自动生成条形码打印出来。
而DHL给的条形码要求是interleaved 2of5.

查了一圈资料得知interleaved 2of5是没有check digits的
但是生成出来的条码很明显不对

后来在wikipedia发现A checksum can be added as last digit, which is calculated in the same way as UPC checksums.
于是用标准的checksums来计算check digit即

> In the UPC-A system, the check digit is calculated as follows:
> 
> Add the digits in the odd-numbered positions (first, third, fifth,
> etc.) together and multiply by three. Add the digits in the
> even-numbered positions (second, fourth, sixth, etc.) to the result.
> Find the result modulo 10 (i.e. the remainder when divided by 10.. 10
> goes into 58 5 times with 8 leftover). If the result is not zero,
> subtract the result from ten.

但是生成出来的条码依旧和DHL给的范例不一样。反馈给DHL他们也说他们的机器扫描不成功。
后来以为是条码宽度问题。根据DHL给的要求把每条宽度设置为0.5mm到0.33mm之间。总宽度42mm
再次提交，DHL反馈说扫描出来了但是数字不对。首位多了0，末尾多了8.
万能的wikipedia又告诉我

> Before the actual pairs there is a start code consisting of nnnn
> (narrow bar-narrow space- narrow bar-narrow space), and after all
> symbols there is the stop code consisting of Wnn (Wide bar-narrow
> space-narrow bar).
> 
> Because digits are encoded by pairs, only an even number of digits can
> be encoded. Typically an odd number of digits is encoded by adding a
> "0" as first digit, but sometimes an odd number of digits is encoded
> by using five narrow spaces in the last digit.

瞬间想到最后以为是不是barcode生成器自动给我添加的校验位。去查看了生成类的源代码发现

    static public function compute($code, $crc, $type){
            if (! $crc) {
                if (strlen($code) % 2) $code = '0' . $code;
            } else {
                if ( ($type == 'int25') && (strlen($code) % 2 == 0) ) $code = '0' . $code;
                $odd = true;
                $sum = 0;
                for($i=strlen($code)-1; $i>-1; $i--){
                    $v = intval($code[$i]);
                    $sum += $odd ? 3 * $v : $v;
                    $odd = ! $odd;
                }
                $code .= (string) ((10 - $sum % 10) % 10);
            }
            return($code);
        }

然而不传递checkdigit进去生成出来的依旧不对。
这时候想到DHL一开始发的Check digit calculation , Factor 4 and 9 see Specification。
wikipedia了一下。终于发现了

> Identcode and Leitcode are variants of interleaved 2 of 5 with check
> digits used by Deutsche Post.

一开始还不知道Deutsche Post是什么。查了一下 ，不就是DHL么。。。。
好坑啊。DHL还用自己的checkdigit规范。

果断去把生成类里的代码改成

    $sum += $odd ? 4 * $v : 9 * $v;

又生成了一张。发现和DHL给的范例终于一模一样了。。

大功告成。
然而不知道为啥DHL用自己的checkdigit规范不用国际通用标准。真是好坑好坑。
另外，wikipedia真是个好东西。然而国内百度一下并没有任何资料。全都是卖东西的。
