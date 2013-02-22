Overview
=========

Flying is a jQuery plugin that create an "On the flying notification box" (like gmail notification).
	
Getting Started
========

Embedding css to head
--------
    <link rel="stylesheet" type="text/css" href="resources/css/jquery.flying.css"/>

Embedding javascript library to the end of body
--------
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script>
    <script type="text/javascript" src="js/jquery.flying.js"></script>

Using it
--------
1. Create first Hello world message:

    $.flying().show("This is Hello world message ...")

2. Create error style message:

    $.flying().show("This is Error message ...", "error")

3. Hide message:

    $.flying().hide()

4. Create auto hiding message:

    $.flying().show("This message will auto hide after 3 seconds ...").wait(3000).hide();

5. And more ... :

    $.flying().show("This message display in 3 seconds after be changed ...").wait(3000).show("This message display in 5 seconds after be hided ...")wait(5000).hide();
    