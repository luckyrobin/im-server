#!/usr/bin/expect
set user "xiongjin@itcast.cn\r"
set passwd "a3241221\r"

spawn git pull
expect "User*" {send $user}
expect "Pass*" {send $passwd}
interact