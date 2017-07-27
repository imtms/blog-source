---
title: 根据自己的基因数据分析喝酒脸红的原因
categories: By TMs
tags: [gene]
date: 2017-5-25 11:23:00
---
经过一个多月的等待，自己的基因数据昨天终于出来了。昨天先看了一些基本的分析报告，今天把原始数据导入了数据库，整整60万个SNP位点，现在就来拿原始数据看一下我的性状表现。

酒精在体内的代谢是一个相对比较简单的过程。首先是乙醇通过乙醇诱导肝细胞色素酶和乙醇脱氢酶变为乙醛，乙醛再通过乙醛脱氢酶变成乙酸，最后分解为水和二氧化碳。

其中乙醛是中毒的罪魁祸首，对各脏器伤害极大，而乙酸是醋的主要成分，对人体几乎无害。

这样就可以看出，和酒精代谢主要相关的酶有乙醇诱导肝细胞色素酶、乙醇脱氢酶（ADH）和乙醛脱氢酶（ALDH），其中相应的控制基因有CYP2E1、ADH1B、ADH1C、ALDH2。

### 查找SNPedia资料得知

#### 关于ADH

> A SNP in rs1229984 encodes a form of the alcohol dehydrogenase ADH1B gene that significantly reduces the clearance rate of alcohol from the liver. This SNP is also known as Arg48His, with the (G) allele corresponding to the Arg and the (A) to the His.
Known in the literature as ADH2*2 or sometimes ADH1B*2, the allele with increased activity (meaning more rapid oxidation of ethanol to acetaldehyde) is His48, encoded by rs1229984(A). Individuals with one or especially two ADH2*2 alleles, ie genotypes rs1229984(A;G) or rs1229984(A;A) are more likely to find drinking unpleasant and have a somewhat reduced risk for alcoholism.
A study of over 3,800 cases of "upper aerodigestive" cancers (mouth/throat, voice box, and esophageal cancers) concluded that the rs1229984(A) allele (in dbSNP orientation) has a protective effect. Carriers of this allele had a 0.56x (decreased; p=10-10) risk of having one of these cancer types.

说明ADH1B基因的rs1229984(SNP)(G>A)会导致个体间乙醇代谢为乙醛的速度存在差异，携带rs1229984(A)基因的人群会加速乙醇至乙醛的转化。如果为(A;A)则转化速率更快。同时rs1229984(A)对上消化道癌症（食管癌、吼癌等）有保护作用，可以降低得这些癌症的风险。

#### 关于ALDH

> rs671 is a classic SNP, well known in a sense through the phenomena known as the "alcohol flush", also known as the "Asian Flush" or "Asian blush", in which certain individuals, often of Asian descent, have their face, neck and sometimes shoulders turn red after drinking alcohol.
The rs671(A) allele of the ALDH2 gene is the culprit, in that it encodes a form of the aldehyde dehydrogenase 2 protein that is defective at metabolizing alcohol. This allele is known as the ALDH*2 form, and individuals possessing either one or two copies of it show alcohol-related sensitivity responses including facial flushing, and severe hangovers (and hence they are usually not regular drinkers). Perhaps not surprisingly they appear to suffer less from alcoholism and alcohol-related liver disease. 

说明ALDH2基因的rs671(SNP)(G>A)会导致个体乙醛代谢为乙酸的速度存在差异，携带rs671(A)基因的人转换乙醛为乙酸的速度要慢，导致体内乙醛水平的积聚。

查看我自己的基因数据

    rs1229984为AA
    rs671为AG

综上分析可知，我的基因型为ADH效率高，能迅速将乙醇转化成乙醛，但乙醛代谢为乙酸速度较慢，会导致体内乙醛水平积累，表现为喝酒脸红，全身红，容易表现出恶心呕吐症状，是乙醛积累的结果。