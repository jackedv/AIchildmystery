export const LEVEL = {
  id: "princess-river-1", title: "过河不拆桥", goal: "让公主安全到达河对岸",
  scene: "assets/level-1/scene.jpg", size: [1672, 941],
  constraints: ["只能使用图中已经出现的物体。", "用一句话描述方案。"],
  intro: ["王子还在远方等着公主。\n可是，一条河挡住了她的去路。", "公主不能独自游过这条河。\n你能用眼前的东西，帮她安全到达对岸吗？"],
  objects: [
    { id: "princess", name: "公主", fact: "她可以走路、抓紧绳子或坐进稳定的木桶，但不能独自游过河。", areas: [[142,312,247,385]] },
    { id: "bridge", name: "旧桥板", fact: "长长的木板立在岸边，底部有铰接件。木头可以漂浮，也会燃烧；桥面需要稳定的支撑。", areas: [[505,93,202,493]] },
    { id: "swing_rope", name: "树枝吊绳", fact: "绳子系在结实的树枝上，下面有一个绳圈。抓住它可以摆荡，松手后就不能再靠它支撑。", areas: [[454,86,50,202]] },
    { id: "barrels", name: "两个空木桶", fact: "两个空木桶在公主这一侧。空桶可以漂浮；桶身圆，单独漂浮时容易摇晃。", areas: [[85,714,278,162]] },
    { id: "pulley", name: "木架滑轮", fact: "木架立在对岸，顶部装着滑轮。滑轮可以改变拉绳的方向，木架需要站得稳。", areas: [[1372,261,226,350]] },
    { id: "long_rope", name: "滑轮长绳", fact: "绳子跨过滑轮，一端伸到河中央附近。绳子可以拉紧、打结，松绳不能形成稳定的支撑。", areas: [[936,652,100,48],[1095,493,109,48],[1249,376,101,49],[1611,480,43,103]] },
    { id: "stones", name: "河边石块", fact: "岸边和浅水里有石块。石头坚硬、沉重，不会漂浮，湿表面可能很滑。", areas: [[45,495,134,119],[329,504,88,64],[1111,555,144,75],[1505,636,145,75],[547,741,116,65]] },
    { id: "river", name: "河流", fact: "河水在流动，中间比岸边深。水能让一些物体漂浮，但不能直接托住站立的人。", areas: [[718,540,187,244]] },
    { id: "tree", name: "大树", fact: "树扎根在左岸，树枝上挂着绳子。树干和树枝是木头，会燃烧；改变树枝会影响挂在上面的绳子。", areas: [[39,186,118,251]] },
    { id: "leaves", name: "树叶", fact: "树上有很多叶子。叶子很轻，有些能浮在水面，但薄薄的叶子很容易散开。", areas: [[169,14,253,134]] },
    { id: "soil", name: "岸边的土", fact: "两岸有土和草。土遇水会变湿、松散；挖掉岸边的土，会影响岸边是否稳固。", areas: [[418,638,97,109],[1090,668,106,122]] },
    { id: "plants", name: "草、花和果实", fact: "河岸有草和花，树上有果实。它们可以摘取，但细软的植物容易弯曲或断开。", areas: [[404,397,84,87]] }
  ],
  references: {
    princess:["assets/level-1/girl.png"],
    bridge:["assets/level-1/bridge_plank_tall.png"],
    barrels:["assets/level-1/barrels_pair.png"],
    pulley:["assets/level-1/pulley_rig_with_rope.png"],
    long_rope:["assets/level-1/pulley_rig_with_rope.png"],
    swing_rope:["assets/level-1/rope_tree.png"],
    stones:["assets/level-1/rock_01.png","assets/level-1/rock_02.png","assets/level-1/rock_03.png","assets/level-1/rock_04.png"]
  }
};
