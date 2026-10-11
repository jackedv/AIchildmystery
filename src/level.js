export const LEVEL = {
  id: "princess-river-1", title: "过河不拆桥", goal: "让公主安全到达河对岸",
  scene: "assets/level-1/scene.jpg", size: [1672, 941],
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
    princess:["assets/level-1/girl.png"],
    bridge:["assets/level-1/bridge_plank_tall.png"],
    barrels:["assets/level-1/barrels_pair.png"],
    pulley:["assets/level-1/pulley_rig_with_rope.png"],
    long_rope:["assets/level-1/pulley_rig_with_rope.png"],
    swing_rope:["assets/level-1/rope_tree.png"],
    stones:["assets/level-1/rock_01.png","assets/level-1/rock_02.png","assets/level-1/rock_03.png","assets/level-1/rock_04.png"]
  }
};
