AspFE Tools 设计思路
===
现在做某个小流量的需求时，需要`svn cp`全流量到小流量，同时修改复制后的小流量文件夹中的模板引用的widget。开发测试完成后，提交时，需要提交抽样文件。小流量上线测试完成后，如果需要转全，则需要把之前复制的小流量文件夹中的内容`merge`到全流量模板中（这里要注意，在这段时间，全流量模板可能会因为其他的需求而改变，因此，这里需要人工去比较）。

综合来看，步骤比较繁琐，需要人工参与的步骤比较精细，稍微粗心一点就会出错。因此，设计一个工具，把人工参与的工作尽量用工具来实现。完整的开发一个小流量需求的步骤如下：

比如，某次小流量的需求名字为`xxxx`

1. `svn cp`需要修改的数据源的全流量模板以及widget，如果需要修改js，则还需要`svn cp`219模板的`anticheat`。如果widget有多个，则需要多次`svn cp`。
    

        $ svn cp 1/baiduASPT1S 1/baiduASPT1_xxxx
        $ svn cp 204/baiduASPT204S 204/baiduASPT204_xxxx
        $ svn cp 213/baiduASPP213HS 213/baiduASPP213_xxxx
        $ svn cp 217/baiduASPT217S 217/baiduASPT217_xxxx
        $ svn cp 219/anticheat 219/anticheat_xxxx

        $ svn cp widgets/icons widgets/icons_xxxx
        $ svn cp widgets/guanwang widgets/guanwang_xxxx


2. 进入刚才复制的`baiduASPT1_xxxx`，`baiduASPT204_xxxx`，`baiduASPP213_xxxx`，`baiduASPT217_xxxx`，遍历里面的tpl文件，把引用widget并且`scope=global`的地方改为引用刚刚创建的`icons_xxxx`，`guanwang_xxxx`等等。

3. 提测，提测时注意，测试的模板要命中本次修改的模板。

4. 小流量上线，注意根据之前的小流量的名字`xxxx`来修改抽样文件。

5. 如果本次小流量不需要转全，则可以把本次的修改下掉。`svn cp`出来的小流量模板可以删掉，也可以保留。抽样文件中的`xxxx`小流量抽样一定要下掉。

6. 如果需要转全，则需要把之前复制的`baiduASPT1_xxxx`，`baiduASPT204_xxxx`，`baiduASPP213_xxxx`，`baiduASPT217_xxxx`，`anticheat_xxxx`，`icons_xxxx`，`guanwang_xxxx`等等合并到对应的全流量模板中。  

综上所述，不难看出，前5步通过自动化工具都可以实现。关键在第6步，因为在你本次做小流量的时候，可能会有另外的同学做其他的需求，**可能现在的全流量模板已经不是你之前`svn cp 204/baiduASPT204S 204/baiduASPT204_xxxx`的那个全流量模板`baiduASPT204S`了**。  

如果出现这种情况，则需要首先把最新的`baiduASPT204S`合并到你的`baiduASPT204_xxxx`中，然后再把你所做的小流量`baiduASPT204_xxxx`合并到全流量模板`baiduASPT204S`中去。

这种情况下，我认为人工的比较是必不可少的，但是我们也可以通过工具去减少工作量。我想到的方法是（这里仅以复制`204`数据源为例）： 

在第1步`svn cp 204/baiduASPT204S 204/baiduASPT204_xxxx`时，比如我们需要把`baiduASPT204_xxxx`里`index.tpl`文件里的`{%vui_widget name="icons" scope="global"%}`改为`{%vui_widget name="icons_xxxx" scope="global"%}`，其他的我们不需要改动，那么在这一步之前（在修改`icons_xxxx`之前），我们就把需要变化的文件（本例中就是`baiduASPT204_xxxx/index.tpl`）做备份，备份可以写入到`.aspfe`目录中。待到第6步时，我们需要把备份的`index.tpl`和最新的全流量的`baiduASPT204S/index.tpl`做比较，如果没有变化，说明这个文件在你做小流量的这段时间没有变化，那么你就可以放心从你的小流量合并到最新的全流量中；如果有变化，这就需要人工去合并了。至于`baiduASPT204_xxxx`中的其他文件，只要本次的小流量没有变化，那么就不用合并到全流量，直接用全流量现有的就行。

我们的工具实际上就是基于nodejs的命令行程序。综合上面所整理的，我们的工具提供如下的命令（**我们的工具运行在template目录下**）：

#### 1. $ aspfe init

初始化`aspfe`工具，在`template`目录下生成`.aspfe`目录，并生成`aspfedata`项目元信息，
`aspfedata`里面的初始内容是cr文件的路径（为后续调用命令发cr做准备），以及各个数据源全流量模板的映射以及`widget`信息。文件内容示例：

    {
        "widget": [
            "app",
            "baiduHYTag",
            "commitment",
            "coupon",
            "dropdownmenu",
            "guanwang",
            "icons",
            "iconsLD1",
            "iknowrenzhengjs",
            "imgtip",
            "newnsrenzhengjs",
            "newnsrenzhengl",
            "newnsrenzhengr",
            "nsrenzhengjs",
            "nsrenzhengl",
            "nsrenzhengr",
            "pa",
            "renzheng",
            "renzhengLD1",
            "shipin",
            "tel",
            "testt",
            "xianzhi",
            "xijing",
            "zhaopai"
        ],
        "crFile": "http://cooder.baidu.com/dynamic/upload.py",
        "globalTplNameMap": {
            "1": "baiduASPT1S",
            "204": "baiduASPT204S",
            "213": "baiduASPP213HS",
            "217": "baiduASPT217S",
            "219": "anticheat",
            "665": "baiduASPT665S"
            ……
        }
    }

#### 2. $ aspfe copy [--ipad | -i] [--widget=widgetName | -w=widgetName]

aspfe copy [--srcid=srcid | -s=srcid] [--suffixName=suffixName | -n=suffixName] [--widget=widgetName | -w=widgetName] [--issue=issue | -u=issue] [--subject=subject | -j=subject]

这条命令采用问答式交互，依次需要填入：

1. `srcid`：本次需要修改的数据源(必须，多个数据源用逗号分隔)
2. `suffixName`：小流量的后缀名(必须)
3. `issue`：对应icafe空间的feature编号，如果输入的是字符串，那么本次小流量的编号就是输入的字符串，如果输入的是数字，那么对应的编号就是`vui-template-`加上你输入的数字。
4. `subject`：对应icafe空间的feature标题

执行此条命令后，会根据你输入的内容执行`svn cp`命令，带`--ipad`或者`-i`参数时，会基于`ipad`的全流量模板做操作，除此之外，还会更新`aspfedata`中的`widget`信息以及在`.aspfe`目录中写入本次小流量的配置信息，文件名为本次实验的名字，文件内容如下：

    {
        "baiduASPP213_houzhui": {           // 本次实验的名字
            "issue": "vui-template-111",    // 本次实验对应icafe空间的feature编号
            "subject": "zhuti"              // 本次实验对应icafe空间的feature标题
        }
    }
