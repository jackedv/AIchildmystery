export const LEVEL = {
  id: "princess-river-1", title: "过河不拆桥", goal: "让公主安全到达河对岸",
  scene: "assets/level-1/scene-initial.png", background:"assets/level-1/background.png", size: [1672, 941],
  goalText:"想想办法，帮公主安全过河吧！", initialAlt:"公主站在左岸，观察图里的物体，想办法安全过河", promptFolder:"river",
  layout:"公主和两个空木桶在左岸；长桥板在左岸铰接点上竖立；树枝挂绳在左岸；木架滑轮在右岸，长绳延伸到河中央；两岸和浅水中都有石块。",
  locations:["left_bank","right_bank","river_or_crossing","unclear"], successLocation:"right_bank",
  successPosition:"公主已经上岸，双脚站在右岸草地", challengePlacement:[135,312,255,382], successPlacement:[1180,340,235,362],
  constraints: ["只能使用图中已经出现的物体。", "用一句话描述方案。"],
  intro: ["王子还在远方等着公主。\n可是，一条河挡住了她的去路。", "公主不能独自游过这条河。\n你能用眼前的东西，帮她安全到达对岸吗？"],
  objects: [
    { id: "princess", name: "公主", fact: "公主穿着白色长裙，站在左岸。她不能独自游过这条河。", areas: [[142,312,247,385]] },
    { id: "bridge", name: "旧桥板", fact: "长木板立在岸边，底部有金属铰接件。木质较硬，可以漂浮，也会燃烧。", areas: [[505,93,202,493]] },
    { id: "swing_rope", name: "树枝吊绳", fact: "绳子系在树枝上，下面有一个绳圈。它由纤维编成，细长、柔韧，受到拉扯时会绷紧。", areas: [[454,86,50,202]] },
    { id: "barrels", name: "两个空木桶", fact: "两个空木桶在左岸，桶身圆、中间空，外面有金属箍。桶是木质的，空桶可以漂浮。", areas: [[85,714,278,162]] },
    { id: "pulley", name: "木架滑轮", fact: "木架立在右岸，顶部有一个金属圆轮。木架较硬，圆轮可以绕着轴转动。", areas: [[1372,261,226,350]] },
    { id: "long_rope", name: "滑轮长绳", fact: "长绳穿过右岸的滑轮，一端延伸到河中央附近。绳子由纤维编成，细长、柔韧。", areas: [[936,652,100,48],[1095,493,109,48],[1249,376,101,49],[1611,480,43,103]] },
    { id: "stones", name: "河边石块", fact: "岸边和浅水里有石块。石头坚硬、沉重，不会漂浮，湿表面可能很滑。", areas: [[45,495,134,119],[329,504,88,64],[1111,555,144,75],[1505,636,145,75],[547,741,116,65]] },
    { id: "river", name: "河流", fact: "河水正在流动，河中央比岸边深。水是液体，没有固定形状，会产生浮力。", areas: [[718,540,187,244]] },
    { id: "tree", name: "大树", fact: "大树扎根在左岸，树枝上挂着绳子。树干是木质的，较硬，树枝有一定弹性。", areas: [[39,186,118,251]] },
    { id: "leaves", name: "树叶", fact: "树上长着很多叶子。叶片很轻、很薄，柔软，容易弯折。", areas: [[169,14,253,134]] },
    { id: "soil", name: "岸边的土", fact: "两岸有土和草。土由许多小颗粒组成，遇水会变湿、变软。", areas: [[418,638,97,109],[1090,668,106,122]] },
    { id: "plants", name: "草、花和果实", fact: "河岸有草和花，树上有果实。草和花的茎比较细软，容易弯曲。", areas: [[404,397,84,87]] }
  ],
  references: {
    princess:["assets/characters/princess-success.png"],
    bridge:["assets/level-1/bridge_plank_tall.png"],
    barrels:["assets/level-1/barrels_pair.png"],
    pulley:["assets/level-1/pulley_rig_with_rope.png"],
    long_rope:["assets/level-1/pulley_rig_with_rope.png"],
    swing_rope:["assets/level-1/rope_tree.png"],
    stones:["assets/level-1/rock_01.png","assets/level-1/rock_02.png","assets/level-1/rock_03.png","assets/level-1/rock_04.png"]
  }
};

export const CASTLE_LEVEL = {
  id:"princess-castle-2", title:"悄悄进城", goal:"让公主进入城堡庭院；站在城墙内侧即成功",
  goalText:"想想办法，帮公主进入庭院吧！", initialAlt:"公主站在城墙外，守卫在主门旁核对送货单，城墙外还有货车、梯子、侧门和排水通道",
  scene:"assets/level-2/scene-initial.png", background:"assets/level-2/background.jpg", size:[1672,941], promptFolder:"castle",
  constraints:["只能使用场景里已有的物品。","不能伤害任何人。","不能触发警报。","用一句话描述方案。"],
  intro:["穿过河流，公主来到了城堡外。\n王子就在城堡的另一边等着她。","守卫正在门口核对送货单。\n你能让公主平安进入庭院，不伤害任何人，也不触发警报吗？"],
  layout:"公主在城墙外前景。主门在右侧，守卫正在验单，货篮、盖章送货单、篷布送货车在主门外。左侧有完整木梯和宽平墙顶，中部有带外侧插销的未上锁侧门，下方有干燥且两端可见的排水通道。主门两片门扇之间的远处绿色草地属于城墙内侧庭院。车夫正等候验单，车内是不透明篷布。",
  locations:["outside_wall","courtyard","wall_or_passage","unclear"],successLocation:"courtyard",
  successPosition:"公主站在城墙内侧庭院草地，主门两片门扇之间的远处草地；不站在门口外的土路上，也不在墙顶或通道中途",
  challengePlacement:[125,482,213,320], successPlacement:[1353,354,78,120],
  objects:[
    {id:"princess",name:"公主",fact:"公主穿着白色裙子，站在城墙外的土路上。",areas:[[125,482,213,320]]},
    {id:"guard",name:"守卫",fact:"主门旁有一名守卫，正在看手里的送货单。他穿着头盔和护甲。",areas:[[1207,447,97,228]]},
    {id:"notice",name:"门口告示",fact:"主门旁挂着一块告示，写着“持有效送货单者可以随货进入”。",areas:[[1027,389,74,129]]},
    {id:"cargo",name:"货篮与送货单",fact:"藤编篮子里装着蔬菜，旁边有一张盖章的有效送货单。纸张薄而柔软，篮子有空隙。",areas:[[1304,637,126,117]]},
    {id:"cart",name:"送货车",fact:"木质货车停在主门外，车轮可以转动，车上盖着不透明篷布。车夫正等待守卫验单。",areas:[[1347,461,290,285]]},
    {id:"ladder",name:"梯子",fact:"一架完整的木梯靠在城墙外，两侧长杆之间有一排横档。木头较硬，梯脚接触草地。",areas:[[308,321,141,277]]},
    {id:"wall",name:"城墙",fact:"城墙由石块砌成，坚硬、厚实。梯子附近的墙顶宽而平，内侧是庭院草地。",areas:[[458,335,143,108]]},
    {id:"side_gate",name:"侧门",fact:"城墙上有一扇没有上锁的小木门，门外能看到金属插销。木门可绕铰链转动。",areas:[[631,447,73,158]]},
    {id:"drain",name:"排水通道",fact:"城墙下有一段低矮的通道，内部干燥，两端开口都能看到。通道边缘由石块砌成。",areas:[[857,541,153,104]]},
    {id:"horse",name:"马",fact:"送货车前有一匹马，身上系着挽具，正在等待。",areas:[[1627,486,45,225]]},
    {id:"barrel",name:"木桶和木箱",fact:"货篮旁有木桶和小木箱，木质较硬，桶外有金属箍。",areas:[[1257,649,54,88],[1425,708,38,45]]},
    {id:"tree",name:"树和树叶",fact:"城墙外有大树。树干是木质的，叶片轻薄，枝条有一定弹性。",areas:[[62,97,210,178]]},
    {id:"stones",name:"石块",fact:"城墙外的草地上有石块。石头坚硬、沉重，表面不完全平整。",areas:[[42,569,179,130],[241,750,180,107],[750,576,84,56]]},
    {id:"soil",name:"草地与土路",fact:"城墙外有草地和土路。土由小颗粒组成，草的茎叶较细软。",areas:[[707,731,162,64]]}
  ],
  references:{princess:["assets/characters/princess-success.png"],ladder:["assets/level-2/ladder.png"]}
};
export const CHARACTERS={challenge:"assets/characters/princess-challenge.png",success:"assets/characters/princess-success.png"};
export const LEVELS=[LEVEL,CASTLE_LEVEL];
export const getLevel=id=>LEVELS.find(level=>level.id===id);
