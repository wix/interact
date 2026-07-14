# Looping Sphere Gallery

A scroll-driven animation for gallery items in a grid/gallery, flex/carousel, layered composition layout. It uses transform, opacity to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: grid/gallery, flex/carousel, layered composition; motion: transform, opacity

## Markup

```html
<div class="hint">SCROLL TO ZOOM · HOVER TO INSPECT</div>

    <div class="viewport">
        <interact-element data-interact-key="scene">
            <div class="scene">
                <div class="sphere">
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(0.0px) translateY(500.0px) translateZ(0.0px) rotateY(0.0deg) rotateX(-90.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>CYBER CORE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 00</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-98.5px) translateY(481.8px) translateZ(90.3px) rotateY(-47.5deg) rotateX(-74.5deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NEON FLUX</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 01</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(16.4px) translateY(463.6px) translateZ(-186.5px) rotateY(175.0deg) rotateX(-68.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NIGHT CITY</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 02</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(138.2px) translateY(445.5px) translateZ(180.2px) rotateY(37.5deg) rotateX(-63.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>MECH SUIT</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 03</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-255.7px) translateY(427.3px) translateZ(-45.2px) rotateY(-100.0deg) rotateX(-58.7deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DEEP SPACE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 04</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(242.6px) translateY(409.1px) translateZ(-154.3px) rotateY(122.5deg) rotateX(-54.9deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>ABSTRACT A</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 05</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-80.9px) translateY(390.9px) translateZ(301.1px) rotateY(-15.0deg) rotateX(-51.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>TECH NODE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 06</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-153.6px) translateY(372.7px) translateZ(-295.8px) rotateY(-152.6deg) rotateX(-48.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NATURE X</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 07</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(331.2px) translateY(354.5px) translateZ(120.9px) rotateY(69.9deg) rotateX(-45.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>SOLAR FLARE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 08</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-342.0px) translateY(336.4px) translateZ(141.2px) rotateY(-67.6deg) rotateX(-42.3deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>WARP DRIVE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 09</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(163.5px) translateY(318.2px) translateZ(-349.3px) rotateY(154.9deg) rotateX(-39.5deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DATA MESH</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 10</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(119.7px) translateY(300.0px) translateZ(381.7px) rotateY(17.4deg) rotateX(-36.9deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>VOID STAR</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 11</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-357.3px) translateY(281.8px) translateZ(-207.1px) rotateY(-120.1deg) rotateX(-34.3deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>CYBER CORE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 12</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(414.9px) translateY(263.6px) translateZ(-91.2px) rotateY(102.4deg) rotateX(-31.8deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NEON FLUX</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 13</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-250.5px) translateY(245.5px) translateZ(356.4px) rotateY(-35.1deg) rotateX(-29.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NIGHT CITY</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 14</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-57.2px) translateY(227.3px) translateZ(-441.7px) rotateY(-172.6deg) rotateX(-27.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>MECH SUIT</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 15</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(347.3px) translateY(209.1px) translateZ(292.7px) rotateY(49.9deg) rotateX(-24.7deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DEEP SPACE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 16</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-461.7px) translateY(190.9px) translateZ(19.1px) rotateY(-87.6deg) rotateX(-22.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>ABSTRACT A</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 17</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(332.6px) translateY(172.7px) translateZ(-331.0px) rotateY(134.9deg) rotateX(-20.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>TECH NODE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 18</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-22.0px) translateY(154.5px) translateZ(475.0px) rotateY(-2.6deg) rotateX(-18.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NATURE X</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 19</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-308.2px) translateY(136.4px) translateZ(-369.3px) rotateY(-140.2deg) rotateX(-15.8deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>SOLAR FLARE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 20</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(481.5px) translateY(118.2px) translateZ(64.8px) rotateY(82.3deg) rotateX(-13.7deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>WARP DRIVE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 21</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-402.1px) translateY(100.0px) translateZ(279.8px) rotateY(-55.2deg) rotateX(-11.5deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DATA MESH</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 22</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(108.3px) translateY(81.8px) translateZ(-481.2px) rotateY(167.3deg) rotateX(-9.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>VOID STAR</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 23</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(246.6px) translateY(63.6px) translateZ(430.3px) rotateY(29.8deg) rotateX(-7.3deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>CYBER CORE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 24</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-474.4px) translateY(45.5px) translateZ(-151.3px) rotateY(-107.7deg) rotateX(-5.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NEON FLUX</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 25</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(453.2px) translateY(27.3px) translateZ(-209.4px) rotateY(114.8deg) rotateX(-3.1deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NIGHT CITY</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 26</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-193.0px) translateY(9.1px) translateZ(461.2px) rotateY(-22.7deg) rotateX(-1.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>MECH SUIT</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 27</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-169.2px) translateY(-9.1px) translateZ(-470.4px) rotateY(-160.2deg) rotateX(1.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DEEP SPACE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 28</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(441.9px) translateY(-27.3px) translateZ(232.3px) rotateY(62.3deg) rotateX(3.1deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>ABSTRACT A</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 29</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-481.5px) translateY(-45.5px) translateZ(126.9px) rotateY(-75.2deg) rotateX(5.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>TECH NODE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 30</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(268.2px) translateY(-63.6px) translateZ(-417.1px) rotateY(147.3deg) rotateX(7.3deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NATURE X</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 31</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(83.5px) translateY(-81.8px) translateZ(486.1px) rotateY(9.8deg) rotateX(9.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>SOLAR FLARE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 32</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-387.3px) translateY(-100.0px) translateZ(-300.0px) rotateY(-127.8deg) rotateX(11.5deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>WARP DRIVE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 33</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(484.2px) translateY(-118.2px) translateZ(-40.1px) rotateY(94.7deg) rotateX(13.7deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DATA MESH</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 34</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-326.7px) translateY(-136.4px) translateZ(353.1px) rotateY(-42.8deg) rotateX(15.8deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>VOID STAR</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 35</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(2.3px) translateY(-154.5px) translateZ(-475.5px) rotateY(179.7deg) rotateX(18.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>CYBER CORE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 36</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(315.3px) translateY(-172.7px) translateZ(347.5px) rotateY(42.2deg) rotateX(20.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NEON FLUX</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 37</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-460.1px) translateY(-190.9px) translateZ(-42.6px) rotateY(-95.3deg) rotateX(22.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NIGHT CITY</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 38</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(361.8px) translateY(-209.1px) translateZ(-274.6px) rotateY(127.2deg) rotateX(24.7deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>MECH SUIT</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 39</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-79.7px) translateY(-227.3px) translateZ(438.2px) rotateY(-10.3deg) rotateX(27.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DEEP SPACE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 40</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-232.0px) translateY(-245.5px) translateZ(-368.7px) rotateY(-147.8deg) rotateX(29.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>ABSTRACT A</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 41</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(409.7px) translateY(-263.6px) translateZ(112.3px) rotateY(74.7deg) rotateX(31.8deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>TECH NODE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 42</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-367.5px) translateY(-281.8px) translateZ(188.6px) rotateY(-62.8deg) rotateX(34.3deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NATURE X</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 43</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(139.0px) translateY(-300.0px) translateZ(-375.1px) rotateY(159.7deg) rotateX(36.9deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>SOLAR FLARE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 44</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(145.4px) translateY(-318.2px) translateZ(357.2px) rotateY(22.2deg) rotateX(39.5deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>WARP DRIVE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 45</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-334.3px) translateY(-336.4px) translateZ(-158.4px) rotateY(-115.4deg) rotateX(42.3deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DATA MESH</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 46</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(336.9px) translateY(-354.5px) translateZ(-103.9px) rotateY(107.1deg) rotateX(45.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>VOID STAR</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 47</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-168.5px) translateY(-372.7px) translateZ(287.5px) rotateY(-30.4deg) rotateX(48.2deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>CYBER CORE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 48</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-65.5px) translateY(-390.9px) translateZ(-304.8px) rotateY(-167.9deg) rotateX(51.4deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NEON FLUX</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 49</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(234.4px) translateY(-409.1px) translateZ(166.5px) rotateY(54.6deg) rotateX(54.9deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NIGHT CITY</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 50</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-257.7px) translateY(-427.3px) translateZ(32.1px) rotateY(-82.9deg) rotateX(58.7deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>MECH SUIT</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 51</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(147.2px) translateY(-445.5px) translateZ(-172.9px) rotateY(139.6deg) rotateX(63.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>DEEP SPACE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 52</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(6.8px) translateY(-463.6px) translateZ(187.1px) rotateY(2.1deg) rotateX(68.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>ABSTRACT A</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 53</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(-93.8px) translateY(-481.8px) translateZ(-95.2px) rotateY(-135.4deg) rotateX(74.5deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>TECH NODE</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 54</h3></div></div>
                </div>
                <div class="item" style="width:149.7px;height:106.9px;left:-74.8px;top:-53.5px;transform:translateX(0.0px) translateY(-500.0px) translateZ(0.0px) rotateY(0.0deg) rotateX(90.0deg)">
                    <div class="item-content"><div class="face front" style="background-image:none"><div class="overlay"></div><h3>NATURE X</h3></div>
                    <div class="face back" style="background-image:none"><div class="overlay"></div><h3>SYSTEM 55</h3></div></div>
                </div>
                </div>
            </div>
        </interact-element>
    </div>

    <interact-element data-interact-key="zoom-track">
        <div class="zoom-track"></div>
    </interact-element>

    <div class="hud">
        <div class="hud-controls">
            <span class="card-count">56 CARDS</span>
        </div>
    </div>
```

## Essential styles

```css
html, body {
            margin: 0;
            scrollbar-width: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        body {
            background: #000;
            font-family: Helvetica, sans-serif;
            color: white;
        }

        .viewport {
            position: fixed;
            inset: 0;
            perspective: 800px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        }

        interact-element[data-interact-key="scene"] {
            display: block;
            transform-style: preserve-3d;
        }

        interact-element[data-interact-key="zoom-track"] {
            display: block;
        }

        .zoom-track {
            height: 500vh;
        }

        .scene {
            position: relative;
            transform-style: preserve-3d;
            width: 0;
            height: 0;
        }

        .sphere {
            position: absolute;
            transform-style: preserve-3d;
            width: 0;
            height: 0;
            animation: spinSphere 40s linear infinite;
        }

        @keyframes spinSphere {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
        }

        .sphere:has(.item:hover) {
            animation-play-state: paused;
        }

        .item {
            position: absolute;
            transform-style: preserve-3d;
            cursor: pointer;
            pointer-events: auto;
        }

        .item:hover {
            z-index: 10;
        }

        .item-content {
            width: 200%;
            height: 200%;
            position: absolute;
            left: -50%;
            top: -50%;
            transform-style: preserve-3d;
            scale: 0.5;
            transition: scale 0.3s ease-out;
        }

        .item:hover .item-content {
            scale: 0.575;
        }

        .face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            text-align: center;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
            overflow: hidden;
            padding-bottom: 16px;
        }

        .face.front {
            background-color: #000;
            background-size: cover;
            background-position: center;
        }

        .face.front .overlay {
            position: absolute;
            bottom: 0; left: 0; width: 100%; height: 50%;
            background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
            pointer-events: none;
            transition: background 0.3s, height 0.3s;
        }

        .item:hover .face.front .overlay {
            height: 80%;
            background: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
        }

        .face.front h3 {
            position: relative;
            z-index: 2;
            color: #fff;
            margin: 0;
            font-size: 24px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 2px;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .item:hover .face h3 { opacity: 1; }

        .face.back {
            background-color: #1a0b0e;
            background-size: cover;
            background-position: center;
            transform: rotateY(180deg);
        }

        .face.back .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.7);
            pointer-events: none;
        }

        .face.back h3 {
            position: relative;
            z-index: 2;
            color: #fff;
            margin: 0;
            font-size: 20px;
            letter-spacing: 4px;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .hud {
            position: fixed;
            bottom: 30px;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            z-index: 100;
        }

        .hud-controls {
            display: inline-flex;
            gap: 15px;
            align-items: center;
            background: rgba(0,0,0,0.6);
            padding: 10px 20px;
            border-radius: 30px;
            border: 1px solid rgba(255,255,255,0.1);
            pointer-events: auto;
        }

        .hint {
            position: fixed;
            top: 20px;
            left: 20px;
            color: rgba(255,255,255,0.4);
            font-size: 12px;
            pointer-events: none;
            z-index: 100;
        }

        .card-count {
            font-size: 10px;
            color: #888;
            border-left: 1px solid rgba(255,255,255,0.1);
            padding-left: 15px;
        }

        @media (max-width: 600px) {
            .hud-controls {
                flex-wrap: wrap;
                justify-content: center;
                width: 90%;
                gap: 10px;
            }
        }
```

## Interact config

```js
const config = {
            interactions: [
                {
                    key: 'zoom-track',
                    trigger: 'viewProgress',
                    effects: [
                        {
                            key: 'scene',
                            fill: 'both',
                            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
                            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
                            keyframeEffect: {
                                name: 'zoom-scene',
                                keyframes: [
                                    { transform: 'translateZ(1200px)' },
                                    { transform: 'translateZ(0px)' },
                                    { transform: 'translateZ(-1200px)' }
                                ]
                            }
                        },
                        {
                            key: 'scene',
                            selector: '.overlay',
                            fill: 'both',
                            rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
                            rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
                            keyframeEffect: {
                                name: 'overlay-fade',
                                keyframes: [
                                    { opacity: 0, offset: 0 },
                                    { opacity: 1, offset: 0.35 },
                                    { opacity: 1, offset: 1 }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
```
