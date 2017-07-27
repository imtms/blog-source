title: iptoint,inttoip
categories: By TMs
tags: [php]
date: 2015-08-06 00:03:10
---

    function ipToInt($sIP)  
    {  
        $aIP = explode('.',$sIP);  
        $iIP = ($aIP[0] << 24) | ($aIP[1] << 16) | ($aIP[2] << 8) | $aIP[3] ;
        if($iIP < 0) $iIP += 4294967296;  
        return $iIP;  
    } 
     
    function intToIP($iIP)  
    {  
        $xor = array(0x000000ff,0x0000ff00,0x00ff0000,0xff000000);  
        for($i=0; $i<4; $i++)  
        {  
            ${s.$i} = ($iIP & $xor[$i]) >> $i*8;  
            if (${s.$i} < 0) ${s.$i} += 256;  
        }  
        return $s3.'.'.$s2.'.'.$s1.'.'.$s0;  
    }  
