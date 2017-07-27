title: CSRF处理
categories: By TMs
tags: [php]
date: 2014-08-26 18:42:00
---

3.1 Cookies Hashing
第一个方案可能是解决这个问题的最简单和快捷的方案了，因为攻击者不能够获得被攻击者的Cookies内容，也就不能够构造相应的表单。
这个问题的实现方法与下面的类似。在某些登录页面我们根据当前的会话创建Cookies：

    <!-- login.php --> 
    <?php 
    // Cookie value 
    $value = "Something from Somewhere"$$ 
    // Create a cookie which expires in one hour 
    setcookie("cookie", $value, time()+3600); 
    ?> 
    <!-- EOF -->

在这里，我们在Cookies中使用了散列来使得这个表单可被认证。

    <!-- form.php --> 
    <?php 
    // Hash the cookie 
    $hash = md5($_COOKIE['cookie']); 
    ?> 
    <form method="POST" action="resolve.php"> 
        <input type="text" name="first_name"> 
        <input type="text" name="last_name"> 
        <input type="hidden" name="check" value="<?=$hash;?>"> 
        <input type="submit" name="submit" value="Submit"> 
    </form> 
    <!-- EOF -->

此时，后台的动态网页部分可以进行如下操作：
   

      <!-- resolve.php --> 
          <?php 
          // Check if the "check" var exists 
          if(isset($_POST['check'])) { 
               $hash = md5($_COOKIE['cookie']); 
               // Check if the values coincide 
               if($_POST['check'] == $hash) { 
                    do_something(); 
               } else { 
                    echo "Malicious Request!"$$ 
               } 
          } else { 
               echo "Malicious Request!"$$ 
          } 
          ?> 
          <!-- EOF -->

事实上，如果我们不考虑用户的Cookies很容易由于网站中存在XSS漏洞而被偷窃（我们已经知道这样的事情并不少见）这一事实，这是一个很好的应对对CSRF的解决方案。如果我们为用户的每一个表单请求中都加入随机的Cookies，那么这种方法会变得更加安全，但是这并不是十分合适。
3.2 HTTP来路
检测访问来路是否可信的最简单方法是，获得HTTP请求中的来路信息（即名为Referer的HTTP头—译者注）并且检查它来自站内还是来自一个远程的恶意页面：这是一个很好的解决方法，但是由于可以对服务器获得的请求来路进行欺骗以使得他们看起来合法，这种方法不能够有效防止攻击。
让我们来看看为什么这并不是一个合适的方法。
下面的代码展示了HTTP Referer实现方法的一个例子：

    <!-- check.php --> 
      if(eregi("www.playhack.net", $_SERVER['HTTP_REFERER'])) { 
           do_something(); 
      } else { 
           echo "Malicious Request!"$$ 
      } 
      <!-- EOF -->

这个检测则会轻易的忽略掉来自某个攻击者伪造的HTTP Referer欺骗，攻击者可以使用如下代码：
header("Referer: www.playhack.net");
或者其他在恶意脚本中伪造HTTP头并发送的方法。
由于HTTP Referer是由客户端浏览器发送的，而不是由服务器控制的，因此你不应当将该变量作为一个信任源。
3.3 验证码
另外一个解决这类问题的思路则是在用户提交的每一个表单中使用一个随机验证码，让用户在文本框中填写图片上的随机字符串，并且在提交表单后对其进行检测。
这个方法曾经在之前被人们放弃，这是由于验证码图片的使用涉及了一个被称为MHTML的Bug，可能在某些版本的微软IE中受影响。
你可以在Secunia的站点上获得关于此缺陷的详细信息：http://secunia.com/advisories/19738/ 。

这里是Secunia关于此Bug解释的概述：
“此缺陷是由于处理“mhtml:”的URL处理器重定向引起的。它可以被用来利用从另外一个网站访问当前的文档”
在同一个页面你会找到来自Secunia工作人员的网站测试方法。

事实上，我们知道，这个Bug已经被微软放出的Windows XP和Windows Vista及其浏览器IE6.0的修复包所解决了。
即使他的确出现了安全问题，这么长时间也会有其他的可靠方案出现。

----------


**4.一次性令牌**
 现在让我们来看经过研究，我希望介绍的最后一种解决方案：在使用这些不可靠的技术后，我尝试做一些不同然而却是更有效的方法。
为了防止Web表单受到Session欺骗（CSRF）的攻击，我决定检测可能被伪装或伪造的每一个项目。因此我需要来创造一次性令牌，来使得在任何情况下都不能够被猜测或者伪装，这些一次性令牌在完成他们的工作后将被销毁。
让我们从令牌值的生成开始：
  

       <!-- start function --> 
         <?php 
         function gen_token() { 
              // Generate the md5 hash of a randomized uniq id 
              $hash = md5(uniqid(rand(), true)); 
              // Select a random number between 1 and 24 (32-8) 
              $n = rand(1, 24); 
              // Generate the token retrieving a part of the hash starting from 
              // the random N number with 8 of lenght 
              $token = substr($hash, $n, 8); 
              return $token; 
         } 
         ?> 
         <!-- EOF -->

 PHP函数uniqid()允许web开发者根据当前的时间（毫秒数）获得一个唯一的ID，这个唯一ID有利于生成一个不重复的数值。
我们检索相应ID值的MD5散列，而后我们从该散列中以一个小于24的数字为开始位置，选取8位字母、
返回的$token变量将检索一个8位长的随机令牌。
现在让我们生成一个Session令牌，在稍后的检查中我们会用到它。
 

    <!-- start function --> 
     <?php 
     function gen_stoken() { 
          // Call the function to generate the token 
          $token = gen_token(); 
          // Destroy any eventually Session Token variable 
          destroy_stoken(); 
          // Create the Session Token variable 
          session_register(STOKEN_NAME); 
          $_SESSION[STOKEN_NAME] = $token; 
     } 
     ?> 
     <!-- EOF -->

 在这个函数中我们调用gen_token()函数，并且使用返回的令牌将其值复制到一个新的$_SESSION变量。
现在让我们来看启动完整机制中为我们的表单生成隐藏输入域的函数：
 

    <!-- start function --> 
     <?php 
     function gen_input() { 
          // Call the function to generate the Session Token variable 
          gen_stoken(); 
          // Generate the form input code 
          echo "<input type="hidden" name="" . FTOKEN_NAME . "" 
               value="" . $_SESSION[STOKEN_NAME] . ""> "$$ 
     } 
     ?> 
     <!-- EOF -->

我们可以看到，这个函数调用了gen_stoken()函数并且生成在WEB表单中包含隐藏域的HTML代码。
接下来让我们来看实现对隐藏域中提交的Session令牌的检测的函数：
   

      <!-- start function --> 
         <?php 
         function token_check() { 
              // Check if the Session Token exists 
              if(is_stoken()) { 
                   // Check if the request has been sent 
                   if(isset($_REQUEST[FTOKEN_NAME])) { 
                        // If the Form Token is different from Session Token 
                        // it's a malicious request 
                        if($_REQUEST[FTOKEN_NAME] != $_SESSION[STOKEN_NAME]) { 
                             gen_error(1); 
                             destroy_stoken(); 
                             exit(); 
                        } else { 
                             destroy_stoken(); 
                        } 
                   // If it isn't then it's a malicious request 
                   } else { 
                        gen_error(2); 
                        destroy_stoken(); 
                        exit(); 
                   } 
              // If it isn't then it's a malicious request 
              } else { 
                   gen_error(3); 
                   destroy_stoken(); 
                   exit(); 
              } 
         } 
         ?> 
         <!-- EOF -->

这个函数检测了$_SESSION[STOKEN_NAME]和$_REQUEST[FTOKEN_NAME]的存在性（我使用了$_REQUEST方法来使得GET和POST两种方式提交的表单变量均能够被接受），而后检测他们的值是否相同，因此判断当前表单提交是否是经过认证授权的。
这个函数的重点在于：在每次检测步骤结束后，令牌都会被销毁，并且仅仅在下一次表单页面时才会重新生成。
这些函数的使用方法非常简单，我们只需要加入一些PHP代码结构。
下面是Web表单：
   

      <!-- form.php --> 
         <?php 
              session_start(); 
              include("functions.php"); 
         ?> 
         <form method="POST" action="resolve.php"> 
              <input type="text" name="first_name"> 
              <input type="text" name="last_name"> 
              <!-- Call the function to generate the hidden input --> 
              <? gen_input(); ?> 
              <input type="submit" name="submit" value="Submit"> 
         </FORM> 
         <!-- EOF -->

 下面是解决的脚本代码：
 

    <!-- resolve.php --> 
     <?php 
          session_start(); 
          include("functions.php"); 
           
          // Call the function to make the check 
          token_check(); 
           
          // Your code 
          ... 
     ?> 

 <!-- EOF -->

你可以看到，实现这样一个检测是十分简单的，但是它可以避免你的用户表单被攻击者劫持，以避免数据被非法授权。

