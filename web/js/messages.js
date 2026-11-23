"use strict";
/* The notes under the bouquet - a different one every day.

   A message that ends with a date in brackets, like "(December 25th)", shows on that day, every year -
   the birthday note too, "(December 9th)".
   Every other day gets one of the numbered messages. Each of her years (birthday to birthday) has its own
   random order, and no message comes twice in a year. With more messages than days, some are left over
   each year: those get their place first the next year (the longer one has waited, the sooner), at a
   random point in it. Every phone and computer shows the same note on the same day.

   Adding messages: just give each new one the next number - nothing else. Each year is made of the messages
   there were on her birthday: the site looks that up on GitHub (this file as it was at the end of that day),
   so messages added during the year wait for her next birthday by themselves, and are sure to come up then.
   The year she is in stays exactly as it was.
   A message's number is its name: rewording a message is fine (the new words show at once), but don't change
   its number, and rather than deleting one, rewrite it - deleting one shuffles the rest of the year a little,
   and a message she has already seen might come again.

   Long messages wrap by themselves; a "|" starts a new line where you want one. Lines starting with "#"
   are ignored. To see another day's note, add "?date=2026-12-25" to the page's address.

   Put [ ] around words to give them the day's effect, like "[Merry Christmas!] | hope you ...": a party on
   her birthday, fairy lights and snow at Christmas, gold and fireworks at New Year, pink on the Women's Days
   (which day gets which: NOTE_EFFECTS in settings.js). The brackets themselves don't show. */

const MESSAGES = `
1. it's nice to see you chase your goals. just don't forget to take care of yourself, too.
2. in case nobody tells you today, you are doing great and i'm proud of you.
3. remember to eat well, drink enough water and have a good rest.
4. make sure to enjoy every moment today and keep your smile on your face.
5. i hope today is kind to you, may it bring peace, blessings, and joy to your good hear.
6. if i could give you one thing of myself in life, i would give you the ability to see yourself through my eyes. only then you'd realize how brilliant you are.
7. your eyes are not your lips, so don't make them red. also your lips are pretty, so use them to smile, smile for future days, remember that.
8. the little you would be so proud of the grown up version of yourself, and she would cheer for what you are fighting for will achive.
9. you can cry as much as you want, but at the same time, smile more, too.
10. the little you would give you a hug, and your future self would pat your head for all of your diligence in the present.
11. nobody is flawless, everybody makes mistakes, but what will your learn from that is more important and non-stop improving yourself.
12. you are just a kid that is being forced to be mature in this society, so be a bit more gentle to yourself.
13. everything will be alright. the sky will be clear after a storm.
14. there are so many first times to look forward to, so be curious and start experiencing.
15. if you ever feel stuck and the world turns its back on you, just remind you that you aren't dealing with this alone.
16. in you, you are beautiful, giving, gentle, and caring.
17. believe in yourself. even if you don't, pretend that you do and at some point, you will.
18. you are braver than you believe and stronger than you seem and smarter than you think.
19. do the best yoy can until you know better. then when you know better, do better.
20. be not afraid of growing slowly, be afraid only of standing still.
21. all of your past failures will nourish your successes in life.
22. when someone tells you 'no' it doesn't mean you can't do it, it simply means you can't do it with them.
23. success isn't about the end result, it's about what you learn along the way.
24. your past never decides who you are, but the future who you wanna become. so don't look back and keep moving forward.
25. give yourself time, then everything will come up roses.
26. not everyone deserves to be in your circle, not everything deserves to be on your schedule.
27. sometimes the most productive thing you can do is rest.
28. how you treat yourself is how you're inviting the world to treat you.
29. love yourself first, and everything else falls in line.
30. lighten up on yourself. no one is perfect. gently accept your humanness.
31. your peace always comes first.
32. you deserve calm and comfort.
33. it is okay to pause and focus on yourself.
34. protect your peace and never feel guilty for it.
35. let today fill your mind with positive energy.
36. be gentle with yourself, even strong hearts need time to recover.
37. make time for yourself and let your strength rebuild in silence.
38. you don't need to solve everything today, sometimes you only need to breath.
39. give yourself permission to pause and notice what your heart needs.
40. your happiness deserves time, attention and care.
41. celebrate yourself for making it through the days that felt difficult.
42. you are enough even on the days when you feel like you are falling behind.
43. love yourself through every season, not only the easy ones.
44. give yourself patience while you become the person you are meant to be.
45. your work matters, but so does the person doing the work.
46. taking a break is part of working well, not a sign of weakness.
47. you can be dedicated to your career without neglecting yourself.
48. protect your energy at work so you still have something left for yourself.
49. you don't have to answer every demand immediately, give yourself room to think and process.
50. taking care of yourself is not selfish, you deserve care too.
51. you don't have to be strong every moment, you are allowed to have difficult days.
52. protect your peace without feeling guilty for choosing yourself.
53. rest your mind, soften your expectations and give yourself time.
54. you are allowed to step away from what drains you.
55. give yourself a permission to slow down when your mind needs a break.
56. always believe that something wonderful is about to happen.
57. if you believe in yourself, anything is possible.
58. focus on improving yourself, not proving yourself to the world.
59. every challenge makes you stronger and wiser. you're growing, learning and evolving into the best version of yourself.
60. you have a kind heart and a pure soul.
61. the world is a little kinder with you in it. i hope some of its kindness finds its way back to you.
62. no matter what life challenges you with, i hope you always face them recklessly and shine even brighter, not discorage you.
63. good things take time, so be more patient to see it comes in your life.
64. you are precious and you matter.
65. you are your own experiment, you are your own work of art.
66. dream big, work hard and surround yourself with good people.
67. success is the sum of small efforts.
68. have anyone told you 'you did a good job!' today? no? then, you did amazing today. i'm proud of you.
69. if you need to talk, i'm here if you need a listener.
70. it's okay to cry, but don't forget to smile more after.
71. your death is way more guranteed than your wedding day, so instead of looking for the love of your life, start living your life with love.
72. people are going to criticize you for everthing. keep setting boundaries, even if they call you dramatic or extreme.
73. just checking in. i hope you drank water today, ate something good and didn't stress so much.
74. life is not perfect, but that doesn't mean it has to be bad all the time. your life is meant to be lived, not just finished.
75. you are not meant to be productive all the time. rest and enjoy it as much as you possibly can.
76. your value doesn't decrease based on someone's inability to see your worth.
77. you don't need to surpress your energy just to be around people who are unable to endure it.
78. don't lose your spark, everything will be okay, you will find yourself back in life. trust me.
79. yesterday is history, tomorrow is a mystery, but today is a gift. that's why it's called the present.
80. it's cool to do both by the way; work hard, and rest your mind and your body; nourish yourself and satisfy your cravings.
81. you're allowed to shift direction and pace. you can hold both stillness and storm, softness and strength.
82. i see how much you try, how much you just want to fly like the rest. the world must feel heavy on your delicate shoulders. but you're enough. you're enough for me. you're enough for everyone.
83. just to let you know, i'm so lucky to have you in my life. you have been so amazing and i'm truly happy that we met.
84. take it easy. we are all struggling to be an adult.
85. today is a long day for you. sleep well tonight, ok?
86. i'm proud of you for winning silent battles that no one knows about, for choosing to keep going even when everything feels heavy.
87. i'm proud of you for existing, for waking up and facing life even when you don't feel like it.
88. i'm proud of you for being strong when all you wanted to do was to cry.
89. thank you for being kind and sincere even the world isn't.
90. probably no one notices but i know you are doing your best. you are doing a good job so don't give up.
91. life is not what could have been, it's what is happening and what you become after everything. so don't hold on the regrets, go enjoy and explore new possibilities.
92. i am so proud of you because i know how hard you try everyday.
93. maybe sometimes you miss the old version of yourself, but hey changing means you become better and stronger. so love this version of you as well.
94. life can be tough sometimes, you know you don't have to rush to become this perfect, responsible adult. sometimes being a carefree kid isn't a bad idea.
95. you don't have to carry the weight of the world on your shoulders all the time.
96. i just want go remind you that you, are lovable, are worthy of love and deserve to be loved.
97. hey, after all the busyness, make sure you dress well, rest well, eat well and drink plenty of water, okay?
98. take good care of yourself. don't let yourself get too tired, alright?
99. you have a bright smile and you must use it because it will cheer people up.
100. just reminding you, you are incredible, stunning and adorable.
101. i hope the world is kinder to let you keep that beautiful smile.
102. i know life hasn't been easy, so please take times to appreciate yourself, for choosing to keep going even when it's hard. you deserve to be proud of yourself.
103. i know you have many dreams and goals right now, i also know the world is still waiting to see you bloom.
104. may you never have to give up the things that make you, "you".
105. may your heart fulfill with joys and you will never run out of reasons to smile.
106. don't be so hard on yourself. you are still learning how to become the person you want to be.
107. it's okay to feel left behind sometimes, to doubt yourself, or to feel like you haven't become the best version of yourself yet.
108. i hope you never lose the softness in you just because life taught you how harsh it can be.
109. the person you become someday will definitely be proud of the girl who kept going when no one knew what you have been through.
110. may the world never make you forget how beautiful it is to be yourself.
111. there is still so much ahead, so do not let one difficult season make you forget how beautiful the future can be.
112. life is not a race. what matters is not how far others have gone, but whether you are little farther than you were yesterday.
113. life is too short to make yourself small just because someone doesn't like you.
114. may you always have the courage to choose what is best for you, without ever being afraid to be yourself.
115. just like a flower, you need time to bloom.
116. always remember to take care of yourself because you're a great person and you're more important than you think.
117. i hope life treats you well, and if it doesn't, i hope you treat yourself well.
118. every piece of you is worth loving.
119. never stop persuing the things you love, even when the road gets bumpy.
120. may your heart always find reason to smile.
121. i know you've been working so hard and i'm proud of you.
122. life is too short, just ignore toxic people and enjoy your life.
123. you are not hard to love, you know? just because some people couldn't love you the way you needed doesn't mean you're difficult to love.
124. it's okay to feel everything you're feeling right now. there is no rulebook on how to handle what life throws at you.
125. no one has the right to tell you how you should be feeling. you're doing the best you can, even if it doesn't feel like it.
126. give yourself the space to heal in your own time, in your own way.
127. i'm so proud of you. because you've survived your hardest days, and better days are coming your way.
128. don't forget that you learned to laugh before you learned to talk.
129. just in case no one has told you today. you are beautiful, you are smart, you are amazing, you are important and you are so loved.
130. there will be plenty of times, you feel petit, doubtful and everything gets dull, you don't know where life leads you to. it's okay, you gotta get going. believe in yourself, in whatever you are doing.
131. i'll sit with you talking about everything and nothing if it means you'd feel like yourself again.
132. when your thoughts turn unkind, borrow these eyes of mine and i'll show you the good you've been struggling to find.
133. behind the girl who overthinks everything is a little kid who just wanted to be seen and be loved.
134. i know it's kinda sad, but, it's okay to be burnt out and do nothing, it's okay to not feel at your best, it's okay to do badly.
135. i found something pretty impressive today. it's you. you're still here, still trying. that is amazing.
136. look how much you've grown so far. that's a win, just saying.
137. just a reminder, you are still blooming. trust me, you will shine bright one day.
138. you have an enchanting smile, so don't hide it away. your eyes are also pretty, so don't let them always carry tears.
139. you are strong, believe in yourself, you are not afraid, you can do it.
140. I applaud your journey of growth and cheer for what you have achieved in life.
141. among those words said to you, you are the most important one.
142. don't be so sad, i know you did everything you could and you tried your best.
143. do what you love and love what you do.
144. you look good today even though i didn't see you but i know you do. you always do.
145. you are kind and soft and good. i hope life is as good to you as you are to the world around you.
146. if it doesn't happen the way you wanted, it will happen in a better way than you imagined.
147. what they hate you is missing in them. keep shining.
148. everything will come to you at the perfect time, in a way that is beyond your expectation.
149. you are so much more that the negative thoughts in your head.
150. just because you're having a rough day doesn't mean you're a mess. struggling is part of being human. you're still awesome even on the tough days.
151. you are allowed to rest, the world can wait a little.
152. just because you could be doing more, doesn't mean you aren't doing enough.
153. i'm proud of you and you should be proud of yourself too for making it this far. you can do this. just one step at a time.
154. may your worries get distracted on their way to bother you tonight.
155. don't be a bully to yourself.
156. stop apologizing for having emotions.
157. you are capable, worthy, resilient and enough.
158. you deserve the same grace you give others.
159. i hope you have a great day because you are a great person and you deserve the best.
160. the world is so much brighter with you in it.
161. what lies ahead is even better that what you're leaving behind.
162. if it makes you happy, don't worry what others think, just laugh.
163. you're gonna be just fine. just stop your crying, and everything will be alright.
164. go on your own pace in a world that's always rushing. you will get there eventually.
165. i hope you heal from the things no one ever apologized for.
166. no matter how hard life will be, you still can always lie down and do nothing for a while.
167. may you never lose hope in the beautiful things that haven't happened yet.
168. it is not your responsibility to correct every false version of you that exists in someone else's head.
169. even a delayed train reaches its destination. your train is late, not lost. keep going, the destination is still yours.
170. no one knows how many times you've turned pain and tears into power to become who you are today.
171. i hope beautiful things happen to you, and when they do i hope you can believe you are worthy of every single one of them.
172. remember to love yourself as much as you love people you love.
173. you are not who you are one year ago, you have grown a lot.
174. be proud of how hard you are trying.
175. all your hard work will be worth it in the end.
176. never forget how special you are.
177. the truth is, everyone is going to hurt you in some way. you just have to find the ones worth suffering for.
178. rest without guilt. you're a human, not a machine.
179. make someone smile every day, but never forget that you are someone too.
180. you don't have to make your problems smaller 'cause you think someone else has it worse. if it matters to you, then be real with it.
181. you are worthy of all the love, all the efforts, being chosen, receiving everything you want.
182. if i'm no longer part of your life, i still hope for your happiness and success.
183. i might not see you, and ypu might not hear from me, but know that i'll always believe in you. every step you take, every dream you reach, i'll be cheering for you in the quietest way.
184. you did more than you think. you dreamed, you started over, you loved, you chose peace, you grew, you had fun, you took time, you treated yourself, you let go, you showed up, you slowed down, ... you did a lot.
185. some of the best parts of your life haven't even found you yet. keep going.
186. sometimes taking a step forward, making progress means you gotta stop for a while, take a moment to figure things out.
187. if you can overthink the worst, why can't you overthink the best?
188. forgive yourself for not knowing earlier what only time could teach.
189. sometimes the thing you're most proud of is also the thing that exhausted you the most. people can admire what it cost you without knowing the cost.
190. maybe your path is harder because your calling is higher.
191. take a look behind you see how far you've become.
192. be gentle. you are meeting parts of yourself you have been at war with.
193. you are so used to your features, you don't know how beautiful you look.
194. you are going through a lot right now. i hope you find your own peace.
195. sometimes, what didn't work out for you, in fact, worked out for you.
196. don't stress too much for a life that can end at any time. make sure to live.
197. be kind. i know you survive and struggle with something you never spoke about.
198. your time on earth is limited, so satisfy your soul not society.
199. the best decisions usually feel lonely before they feel right.
200. it has always been hard, but you have always been brave and that's why you've gotten this far.
201. some days you move forward, other days you slow down to catch your breath. they are both progress.
202. you are strong enough to face it all even if it doesn't feel like it right now.
203. sometimes the bad things happen in your life put you directly on the path to the most wonderful things that will ever happen to us.
204. the joy is coming even if you can't see it yet.
205. i hope you become filled with so much happiness that it heals every part of you.
206. the season you are in is not the season you will always be in.
207. just be yourself and everyone and everything will find you.
208. sometimes you need to get out of your own way. your feelings are valid, but they shouldn't hold you back.
209. you are worthy of every drop of love and joy this life has to offer.
210. i hope you eventually live the life you always dream about and i hope nothing haunts you for too long and i hope you are kind to yourself.
211. there are good memories that you haven't made it yet. so be excited for what is coming in your life.
212. your story isn't over just because this chapter is hard. a good ending is waiting for you.
213. i hope you stop rejecting parts of yourself that you think are unlovable.
214. what matters most is how you see yourself.
215. you deserve the softness you treat others with.
216. please love yourself instead of loving the idea of other people loving you.
217. when you can't look on the bright side, i will sit with you in the dark.
218. being a nice person means being nice to yourself too.
219. don't live your past. live your life. don't let tragedy define you.
220. no one will ever know exactly what it's like to be you, so i hope you stop clinging to what others may or may not be thinking, and live your best life.
221. you fall. you break. you fail. but then you rise. you heal. you overcome.
222. be yourself so the right people looking for you, can find you.
223. do not be afraid to do things alone, some things are only meant for you.
224. whatever choice you make. make peace with it. if it works out, be grateful. if it doesn't, be proud you tried.
225. you might not even close to where you want to be, but very far from where it all started.
226. you shall not worry about what you cannot control.
227. you will get there. but right now you are here, and here is wonderful.
228. you don't always need advice, sometimes a hug is just enough. i can't hug you right now, but let my prayers hug you today.
229. sometimes, the only thing you can do is let it end, let it hurt, let it heal, let it go.
230. may every good thing make its way to you. when they come, embrace them.
231. living, loving, healing, learning, growing.
232. live your life before life leaves you.
233. if everything around seems dark, look again, you may be the light.
234. you radiate kindness no matter what you are going through. thank you for being kind.
235. you are one of the most special humans to exist in this world and you deserve the same love and consideration you give everyone around you.
236. if you spill the water, get a towel. crying doesn't pick it up. but still can cry while doing it. this is not about spilling the water.
237. it had to hurt so you could find out how strong you are. it had to fall apart so you could rebuild something better. it had to happen so you could grow.
238. and if no one sees you, i see you, i'm proud of you.
239. maybe the universe has been looking after you in little ways you haven't noticed yet.
240. i hope life gets a little easier for you soon. i hope something good finds you on the days you are tired of being strong.
241. hope today softens what's been tense, heals what's been tired, and bring you closer to the peace you've been praying for.
242. may today illuminate your path with light, peace and lots of love.
243. if you look back, you see that: loss teaches you how to appreciate, deviation helps you finding the right track, failure gives you experience. so you always can re-start, don't be afraid.
244. it's okay if all you did was exist today.
245. it's okay, you can try again tomorrow. you did great.
246. the world is always trying to make you feel like you have to do more, be more. but maybe you have enough, you do enough, you are enough.
247. it's okay to take it slow. what's meant for you won't pass you by just because you took your time.
248. trust yourself a little more. you've already become so much braver than you used to be.
249. not everything that leaves your life is a loss. sometimes, it's making room for something new, something better.
250. this chapter isn't the end of your story. there are still so many good things waiting for you to discover.
251. you'll experience so many more moments of peace, of overwhelming happiness, of gratitude, of love, of life. hold onto that, and don't let go.
252. you are the greatest masterpiece you'll ever work on.
253. allow yourself to love your body when it changes, your mind when it needs rest, your heart when it is wounded.
254. when you try to be kind to everyone, i hope you include yourself too.
255. things may bring you down, but you have it in you to bounce back.
256. let today be about everything you already have instead of everything you still want.
257. you can't add days to your life, but you can add life to your days.
258. there are far far better things ahead than any you leave behind.
259. you can't always choose to be happy but you can choose to be kind to yourself when you are sad.
260. be proud of yourself because no one knows what it's like to be you everyday.
261. celebrate your personal victories because no one else understands what it took to accomplish them.
262. somewhere there is a past you beaming with pride looking at all the progress you've made.
263. while you might be doubting yourself, i'm here admiring your strength.
264. let today be the day you only speak kind things about yourself.
265. honor the times you strived to become a better version of yourself.
266. courage isn't always roar. sometimes it's the little voice at the end of the day that says "i'll try again tomorrow."
267. you don't have to be everyone's butterfly, be a bee. mind your business, make your honey, and sting people when necessary.
268. bad days are also part of a very good life.
269. don't shame yourself so hard for a mistake. you learn, that's important.
270. i hope the universe give you all the good and genuine things that you deserve.
271. even on your darkest days, to me, you still shine the brightest.
272. in the end, they'll judge you anyway, so do what makes you happy.
273. be who you are. love what you love without worrying others think about you.
274. where you're standing right now was once the goal.
275. some people don't realize how much light they bring into other people's lives just by being themselves. you are one of those people. thank you for existing.
276. if you feel like it's rained too much in your life lately, imagine the flowers that are about to bloom.
277. chase everything you want, except love and death, they'll find you when it's time.
278. be who you are and say what you feel, because those who mind don't matter and those who matter don't mind.
279. life is a constant cycle of losing your spark and finding it again.
280. you've made it through every moment you thought you wouldn't. keep going.
281. sometimes, you already know the answer, your heart just needs a little more time to accept it before going to a conclusion.
282. stop reopening the same wound just to see if it is still hurts.
283. you don't always have to be doing something. you can just be and that's plenty.
284. you are allowed to move at your own pace. there is not rush here.
285. some of your best days are still to come. be patient.
286. never regret having a good heart. all the love you gave to the wrong people will always find its way back to you.
287. just a reminder that all you can do is the best you can do, so be patient with yourself.
288. don't spend today's sunshine worrying about the next rain.
289. exchange overthinking for overwhelming peace, that says "i will be okay without knowing everything."
290. thanks for being the person i can have deep conversations with but also laugh about the most random and dumb stuff.
291. love yourself, not because you are pretty, because it is you. so love yourself. then you will see you are pretty.
292. maybe it will all work out so well that you'll laugh at how much you worried that it wouldn't.
293. you are not who you used to be, and maybe that's the point and it's still okay.
294. whatever you choose in this life, let it be a life you love living.
295. what you give does not always return, but what you give is always who and what you are.
296. may all your delulu come true true true.
297. don't ruin a good today by thinking about a bad yesterday. let it go.
298. it might take you a long time to realize that some things ending was actually the beginning.
299. you're not too sensitive, and the world needs more soft hearts.
300. you never have to apologize for your tears.
301. you deserve the same care you're always giving everyone else.
302. the world still has sweetness to show you.
303. one day you will find all the answers. but for now, focus on enjoying the present.
304. it's okay if your biggest achievement today was simply surviving.
305. do not think less of yourself just because today you were not at your best.
306. sometimes the best news comes right after the hardest week. keep going, because you never know what's waiting.
307. i hope you heal from things you don't talk about.
308. i hope you believe in yourself as much as i believe in you.
309. may you never go back to the dark places you fought so hard to get out of.
310. you can't win at everything, but at least you try.
311. everything happens for a reason, so stay true to yourself, and live your life to the fullest.
312. i hope the world is kind to you today, tomorrow, overmorrow, and forever.
313. life is indeed full of ups and downs, but i hope you will always find a strength to get back up.
314. do the things you love 'cause life has no rewind.
315. your past already took enough from you, don't let it take your future too.
316. in a couple of years it won't even matter how long it took. you'll just be glad you did it. stay focused.
317. please don't give up on your dreams just because your path looks different from everyone.
318. for your own sanity, take a break from what you can't control.
319. life can be a little bit draining sometimes, but don't forget to take care of yourself too.
320. don't put too much pressure on yourself just do your best and that's more than enough.
321. may today be filled with gentleness and many things to look forward to.
322. just checking in that you are taking care of yourself. i care about you.
323. you are absolutely capable of creating the life you can't stop dreaming about.
324. always look for the good. the bad existing doesn't make the good any less real.
325. whatever you choose to do in this life, hope that in the end your soul feels lighter.
326. like the moon, you must go through phases of emptiness to be full again.
327. maybe you don't realize it, but somewhere in this big busy world, your existence is someone's favorite.
328. whatever tomorrow brings you, today still deserves joy.
329. if life isn't gentle with you, then be gentle with yourself, you've endured so much. the least you can do is allow yourself to heal, to rest and feel better again.
330. how lucky am i, to exist at the same time as you.
331. nothing kills you faster than your mind. don't stress over things that are out of your mind.
332. someday, everything will make sense. so for now, laugh at the confusion, smile through the tears and keep reminding yourself that everything happens for a reason.
333. through all the wild you have traveled through, perhaps, this could be a season something good unfolds and feels full circle to you.
334. i wanna listen to the sound of your blinking, wanna listen to your hands soothe, listen to your heart beating, listen to the way you move.
335. the good days will outnumber the bad, keep that in mind.
336. hey. it's okay if you're still figuring it out. you're not late. you're just in a different chapter.
337. out of all the ways the universe could have unfolded, it made space for you. so keep finding joy, laugh until your sides hurt, tell people you love them and treat yourself with the respect you deserve.
338. let them be wrong about you, that's okay. focus on yourself.
339. i'll stand by you even if it means standing against the world.
340. your life is not yours if you always care about what other people think.
341. it's your first time living, so you need to be nicer and be more gentle with yourself.
342. they are so many things that you regret in life. you can always look back on the past, but it's so important to keep going, to grow from it, to learn from it. it's gonna be alright.
343. don't cry for what has passed, cheer because it happened.
344. may all your "soon" turn into "finally".
345. let your hope be relentless.
346. the love for yourself gotta be stronger than your desire to be loved by others.
347. remember to plant your own gardens and decorate your own soul instead of always waiting for someone to bring you flowers.
348. no matter how hard things get, remember i'm always in your corner. either win or lose, i'm right here. anytime you ever need me. i'm here.
349. i know you will hurt. a lot. i know that things will be lost, that you will fall. over and over again. you will make mistakes. lots of them. but you will learn and do better. so get up.
350. you are born into this world with yourself and leave with your only self. so just be you and don't worry too much what others think about you.
351. today is going to be better. if it's not, then tomorrow, you say it again because at somepoint, today will be better.
352. who cares, be happy, be weird, be cringe, be who you want to be. it's worth it if it makes you happy.
353. life is always better with you in it. i hope you know that.
354. no matter how rough the road gets, until you achieve your dreams, keep going, never, ever give up.
355. i hope that all of your tears or laughs, all coming from happiness.
356. every version of you is necessary, even the ones you are ashamed of.
357. little joys are how you survive big sorrow.
358. you can't go back. you can't rewind. you can't undo it, unsay it, un feel it. you're here now because of all of the things you wish never happened, happened. you have survived all your worse days. and you still have further to go.
359. to love at all is to put yourself at a harzard, you will be hurt. it is an abosolute gaurantee that if you work to love someone, if you yearn for love, you will suffer to a degree. and it's very important you understand this, it is not a bad thing.
360. there is no right to be you, there is no right way to exist on this earth. you might be shamed, guilted, convicted for how you live, but who you are is you, and there is no changing that. you can change, which is a blessing, but even as you do, you're still just who you are.
361. let me hug all of your melancholy today. here is my warmest hug for you.
362. people might fake their feelings just to make you happy. but that's not your responsibility to figure that out. your responsibility is being honest for you. just do what you believe to be a good job.
363. everything you lost will be replaced with something better.
364. do kind things and let the universe sort out the rest.
365. you are a museum of everything you've loved.
366. i hope you find a place in this world where you're truly happy.
367. of course everything is falling apart. your new life will cost your old one. so don't stop recreating yourself if you need to.
368. you can have terrible days, lose your confidence, question yourself, or feel completely lost, and none of that changes your true self. it's just temporary.
369. ghost the world if that's what your peace requires. focus on yourself, on your emotions.
370. just a reminder that you deserve to feel proud of yourself, even if you're not exactly where you hopes you'd be by now.
371. i wish so many good things for you.
372. i hope you never doubt the impact of your existence.
373. may you never punish yourself for someone else's inability to see the love in your heart. you deserve someone who cherishes you, your heart, your soul and your mind.
374. you deserve all the love and kindness in the world.
375. when life starts to feel great again, you should let it. you deserve good things too.
376. you are, and always have been worthy of great things.
377. you are so much more than the negative thoughts in your head. you are precious. you are worth it. you are beautiful.
378. free yoursefl. the greatest prison people live in is the fear of what others think.
379. i hope you remember that you do not have to figure everything out today. some things will become clearer with time, and some answers will come as you live. for now, take care of yourself, enjoy what you can, and keep making room for the life you want to live.
380. your energy is your most expensive currency, and not everyone can afford it.
381. for once, just live for yourself even if you think it's selfish.
382. be yourself. you are the only person who's like you and that is an advantage. you are so unique and you are enough. you just haven't realized it yet. don't compare yourself to others. comparison destroys personality.
383. never let anyone kill your vibe when you're doing something you love.
384. not being good at something is the first step in learning how to be good at something.
385. everything you do will come back to you. do good, be good.
386. just because you're carrying it well, doesn't mean it's not heavy. be gentle with yourself.
387. better to be cringe in someone's mind than be caged in your own.
388. rest is a radical form of self love in a world that gratifies exhaustion.
389. there is still so much more. more life left to live, more love to be felt, more sun waiting to kiss your skin, more doors to open for you.
390. there are so many good and beautiful things on their way to you.
391. allow people to have their moods, and allow those moods to have nothing to do with you.
392. when everything feels too much, i hope you remind yourself that you've made it through hard days before and you will again. this isn't the end, you're still becoming.
393. the only flaw that you have is that you don't give yourself enough credit.
394. may you be a magnet of miracles.
395. there is no hurry toward a life that is meant to be lived, not completed.
396. forgive the person you once were and look forward to the person you're becoming.
397. you can still be in the process of figuring things out. it's okay to not know everything right now.
398. you are not a problem that needs to be solved before you can be loved.
399. growth unfolds in spirals, not straight lines. every expansion outward pulls you deeper inward, each turn gently guilding you home to yourself.
400. i hope you can be gentle with yourself today, and if you can't be, i hope you let yourself rest anyway.
401. whatever you decide to do, make sure it makes you happy.
402. maybe this season feels heavy because you are becoming someone you have never been before.
403. nothing about you is too much. thank you for being here. thank you for being you.
404. you will live and learn and make mistakes and accidentally say the wrong things and people will love you anyways.
405. you're going to be okay. the bad doesn't last forever. happiness is coming your way. and i'm proud of you for staying strong.
406. i agree that you may still have a long way to go, but have you seen how far you've come?
407. don't abandon joy because it is brief. don't commit to solitude because happiness is fleeting. it's okay that good things do not last forever. it's okay to simply enjoy a thing for as long as you have it.
408. some of your favorite days haven't even happened yet, and that's the magic of being alove.
409. worrying doesn't take away tomorrow's troubles, it takes away today's peace.
410. your life will be wonderful because you are wonderful, and it will be full of love because you are full of love.
411. it won't suddenly happen overnight, but if you give up, it will never happen.
412. sometimes you don't need a sign from the universe. you need to trust what you're capable of doing.
413. you're not just this ... or this ... or that. you're a million things.
414. maybe you can't have it all, but you don't need it all.
415. in case you make yourself smaller and smaller and smaller, here's a hug.
416. there are people who don't see you even when you're right in front of them. and there others who see you everywhere, even you're not.
417. when they tell you that it's impossible, remember that at the entrance of NASA it says: "it's aerodynamically proven that, due to its size and weight, the bee can't fly. but the bee doesn't know it."
418. you are not your thoughts. your worth is so much more than what your mind is telling you.
419. one day, you will look back on this time of your life with infinite gratitude that you pushed through.
420. you deserve to be loved and respected, always.
421. you are blooming just as beautifully as the flowers you love.
422. just as flowers find their way to bloom, you too find your way.
423. look at the flowers blooming around you. a gentle reminder that you are growing, too.
424. i want you not to play with you, not to use you, not to hurt you. but to make you feel loved, happy, safe, protected, valued and supported. always.
425. you are important to me. 'important,' in Latin, means 'to carry within.' and that's exactly it: i carry you inside me. wherever i go, you are there with me.
426. just because you have a thought doesn't make it true. your thoughts are not always true. sometimes they're just a little bit of a mean thought. no matter what you think or feel, you are still enough.
427. you never lose, you either win or learn.
428. the world will convince you that you need more, i hope you carry the gratitude to see you're already have enough.
429. i will always care for you. even if i can no longer be there for you to see it. you'll feel it in the breeze and the sunshine and the grass between your toes.
430. no matter how dark it gets, the sun will rise again and kiss your forehead, kiss your cheeks and kiss your smile.
431. there are no wrong decisions, because every choice simply takes you exactly where you're meant to go.
432. from the many hopes, i hope thay you live with a calm heart.
433. if you don't know what to pursue in life right now, pursue yourself. pursue becoming the healthiest, happiest, most healed, most present, most confident version of yourself.
434. your self-love must be stronger than your desire to be loved. don't get so caught up in being someone else's favourite person that you forget to enjoy being your ow.
435. there is so much more to life than the present.
436. what others think of you has nothing to do with who you are.
437. you don't have to be perfect to be deserving of good things.
438. be positive, think positive and positive things will happen.
439. you're going to be surprised real soon at how everything suddenly and miraculously worked in your favor. you will realize how your current situation was only leading you to be a blessing. nothing is a mistake.
440. next time when you think of something beautiful, don't forget to count yourself too.
441. the universe doesn't take from you without giving something better.
442. the beauty you see in anything is a reflection of the beauty in you.
443. being left out doesn't mean there's something wrong with you. sometimes people won't choose you. that doesn't mean you are any less wonderful.
444. appreciate what you have while you're working for what you want. don't spend so much time, looking forward to the next chapter that you forget to live this one.
445. your direction is more important than your speed. so take it slow and enjoy the journey as much as you can.
446. and here you are, continuing on, despite how hard it's been. i'm proud of you.
447. when it gets hard to breathe and easy to spiral into dark thoughts, i want you to remember this: you are here for a reason. no matter how insignificant you currently feel, you are making a positive impact in this life.
448. 1 bad minute? you still have 59. 1 bad hour? you still have 23. 1 bad day? you still have 6. 1 bad week? you still have 3. 1 bad month? you still have 11. 1 bad year? you still have your whole life.
449. one day, you're gonna sit down and congratulate yourself. you will smile and say it was hard but you made.
450. just because you would do it for them doesn't mean they would do it for you.
451. if they wanted to, they would because when you wanted to, you did.
456. set a goal and take it as a direction, not something you must achieve; then you will work more efficiently and enjoy the progress.
457. you have completely no idea how beautiful you are in my eyes.
458. eat good, drink good, feel good, it's all good. 
459. it's okay to not know how to put your feelings into words. 
460. it's okay. it will be okay. you're okay. you will be okay.
461. it's okay to feel lost. you're not behind, you're just on your own path.
462. maybe living your best life just means slowing down enough to see how good it already is.
463. your death will come on an ordinary day, in the middle of unfinished plans, and the world will continue without you. so live a little more.
464. the most dangerous form of blindness is believing that your perspective is the only reality.
465. the magic in your childhood wasn't because you were a child, it was because you were living in the present.
466. the way you speak to yourself matters.
467. be kind to yourself. you deserve it.
468. talk to yourself like someone you love.
469. love yourself like the way you wish they did.
470. don't lose belief in yourself, you are so deserving.
471. i hope you never forget how many beautiful things there are about you.
472. you are loved no matter how you feel.
473. you still haven't met all of the people who are going to love you.
474. sometimes people pretend you're a bad person so they don't feel guilty for how they treated you.
475. i hope you know that even when i'm not around, i'm always rooting for you.
476. did you drink water today or just matcha?
477. a beautiful thing is never perfect. you are not perfect and you are still beautiful.
478. what's coming is better that what's gone.
479. don't ruin your beautiful soul to fit into an ugly society.
480. dear you, who cried yourself to sleep and still got up and chose yourself in the morning, i'm so proud of you.
481. stop shrinking yourself just to make someone else feel whole.
482. don't lose yourself, okay? i know it's hard, but you are going to be okay. don't lose yourself to all of this stress. you are okay, you are you and you are going to be just fine.
483. you don't have to be where someone else is to be exactly where you need to be. take your time, take a breath, keep going. this life is yours. you will never be late in life, it is your life.
484. you love the ocean but doesn't mean you really have to drown in it to prove people that you do.
485. people don't always treat you like how they feel about you. sometimes they treat you based on the state of mind they're in. they will unintentionally hurt you because they're at war with themselves and suffering with things that has nothing to do with you.
486. we all have two lives. the second begins when you realize you only have one. live right now, because you do not know when you won't have any more time.


[Happy Birthday!] | Hoàng Thảo My | <3 (December 9th)

[Happy International Women's day, gorgeous.] | be the brightest blooming flower today. | <3 (March 8th)

[Happy Vietnamese Women's day, princess.] | you look pretty as always. | <3 (October 20th)

[Christmas Eve] today! | Santa is checking his list one last time tonight. don't worry, you're definitely on the nice one. also keep yourself warm. (December 24th)

[Merry Christmas!] | hope you have a great holiday. Santa is coming, 'cause you have been kind this year. (December 25th)

it's [New Year's Eve!] | before this year end, i wanna tell you: | thank you for helping me, thank you for being there, thank you for listening, thank you for understanding, thank you for believing, thank you for showing up, thank you for making life feel a little lighter. (December 31st)

[Happy New Year!] | i wish you health and success. i wish you all the happiness in the world. i wish you nothing but the best in life. (January 1st)
`;

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const DAY_MS = 86400000;
const dayNumber = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / DAY_MS);   // counts whole days, whatever the clocks do
const dayKey = (m, d) => `${m}-${d}`;
function readNote(text) {               // "[Merry Christmas!] | hope ..." -> its lines, and the [marked] stretches of each
  const lines = [], marks = [];
  let open = false;                     // inside [ ] (it can go on past a "|")
  for (const part of text.split("|")) {
    let line = "", from = 0;
    const m = [];
    for (const c of part.trim()) {
      if (c === "[") { open = true; from = line.length; }
      else if (c === "]") { if (open) m.push([from, line.length]); open = false; }
      else line += c;
    }
    if (open) m.push([from, line.length]);
    if (line) { lines.push(line); marks.push(m); }
  }
  return { lines, marks };
}

function readMessages(text) {           // the numbered messages, and the dated ones by day
  const daily = [], dated = {}, ids = new Set();
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || /^added\s/i.test(line)) continue;   // ("added" lines aren't needed any more)
    const n = line.match(/^(\d+)\.\s*(.+)$/);                                       // "12. ..."
    if (n) {
      if (ids.has(+n[1])) console.warn(`messages.js: two messages have the number ${n[1]} - give each its own`);
      ids.add(+n[1]);
      daily.push({ id: +n[1], note: readNote(n[2]) });
      continue;
    }
    const d = line.match(/^(.+?)\s*\(\s*([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*\)$/i);   // "... (December 25th)"
    const month = d ? MONTHS.indexOf(d[2].toLowerCase()) + 1 : 0;
    if (month) dated[dayKey(month, +d[3])] = readNote(d[1]);
    else console.warn("messages.js: this line has no number and no date, so it is left out:", line);
  }
  return { daily, dated };
}
const NOTES = readMessages(MESSAGES);
if (!NOTES.dated[dayKey(BIRTHDAY[0], BIRTHDAY[1])]) console.warn("messages.js: there is no message for her birthday");

function mix32(x) {                     // scrambles a 32-bit number (murmur3's finalizer)
  x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}
const yearSeed = (year) => mix32(Math.imul(year, 0x9e3779b1) ^ 0x2545f491);   // a random seed for each of her years
// where a message comes in that year's order: random, but it only depends on the year and the message's
// number - so adding, removing or editing other messages never moves it
const rank = (year, id) => mix32((yearSeed(year) + Math.imul(id, 0x27d4eb2f)) >>> 0);

const FIRST_YEAR = 2026;                // her first year with the bouquet: from her birthday in 2026
const herYear = (y, m, d) => (m > BIRTHDAY[0] || (m === BIRTHDAY[0] && d >= BIRTHDAY[1]) ? y : y - 1);   // the year of hers that day is in, by the birthday it began on

/* Which messages there were on each birthday. Each birthday's list is looked up once on GitHub - this file as it
   was at the end of that day - and then remembered on this phone or computer. Until a birthday has passed, or
   without a connection, the messages as they are now stand in. */
const MESSAGES_PATH = "web/js/messages.js";
const POOLS = {};                       // year -> the numbers of the messages there were on her birthday that year
const birthdayEnd = (year) => new Date(year, BIRTHDAY[0] - 1, BIRTHDAY[1] + 1);   // the midnight after it
const poolKey = (year) => `bouquet ${GITHUB_REPO} ${year}`;
async function fetchPool(until) {       // the message numbers in this file as it was on GitHub at that moment (null: no file yet)
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?path=${MESSAGES_PATH}&until=${until.toISOString()}&per_page=1`);
  if (!res.ok) throw new Error(`GitHub said ${res.status}`);
  const commits = await res.json();
  if (!commits.length) return null;
  const raw = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/${commits[0].sha}/${MESSAGES_PATH}`);
  if (!raw.ok) throw new Error(`GitHub said ${raw.status}`);
  const text = await raw.text(), from = text.indexOf("const MESSAGES = `");
  return from < 0 ? null : readMessages(text.slice(from + 18, text.indexOf("\n`;", from))).daily.map((msg) => msg.id);
}
function poolsToLookUp(year) {          // the passed birthdays up to that year's that we don't know yet (after taking what's remembered)
  const missing = [];
  for (let y = FIRST_YEAR; y <= year && birthdayEnd(y) <= new Date(); y++) {
    if (POOLS[y]) continue;
    try { const saved = localStorage.getItem(poolKey(y)); if (saved) { POOLS[y] = new Set(JSON.parse(saved)); continue; } } catch (e) { /* no storage */ }
    missing.push(y);
  }
  return missing;
}
async function lookUpPools(years) {     // find them on GitHub and remember them; true if any was found
  let found = false;
  for (const y of years) {
    try {
      const ids = await fetchPool(birthdayEnd(y));
      if (!ids || !ids.length) continue;
      POOLS[y] = new Set(ids); found = true;
      try { localStorage.setItem(poolKey(y), JSON.stringify(ids)); } catch (e) { /* no storage */ }
    } catch (e) { console.warn(`messages.js: couldn't look up the messages of her ${y} birthday (${e.message})`); }
  }
  return found;
}

function numberedDays(from, to, dated) { // how many of the days from .. to-1 get a numbered message
  let n = 0;
  for (let i = from; i < to; i++) {
    const day = new Date(i * DAY_MS);
    if (!dated[dayKey(day.getUTCMonth() + 1, day.getUTCDate())]) n++;
  }
  return n;
}
function yearPlan(year, notes) {        // that year's messages in their order, and how long each had waited for its turn
  const plans = notes.plans || (notes.plans = {});
  if (plans[year]) return plans[year];
  const [bm, bd] = BIRTHDAY, start = dayNumber(year, bm, bd);
  const days = numberedDays(start + 1, dayNumber(year + 1, bm, bd), notes.dated);
  const last = year > FIRST_YEAR ? yearPlan(year - 1, notes) : null;
  const known = POOLS[year];            // the messages there were on her birthday (not known yet: all of them)
  let pool = notes.daily.filter((msg) => !known || known.has(msg.id));
  if (!pool.length) pool = notes.daily.slice();
  const waited = new Map();             // years in a row a message didn't come up (a new one counts as 1)
  for (const msg of pool) waited.set(msg.id, !last || last.shown.has(msg.id) ? 0 : (last.waited.get(msg.id) || 0) + 1);
  const byRank = (a, b) => rank(year, a.id) - rank(year, b.id) || a.id - b.id;
  // the ones that waited longest get this year's days first; then they all go in this year's random order
  const order = pool.sort((a, b) => waited.get(b.id) - waited.get(a.id) || byRank(a, b)).slice(0, days).sort(byRank);
  return (plans[year] = { order, shown: new Set(order.map((msg) => msg.id)), waited });
}
function noteFor(y, m, d, notes = NOTES) { // the note for that day: { lines, marks }
  const { dated } = notes;
  if (dated[dayKey(m, d)]) return dated[dayKey(m, d)];   // her birthday, the holidays
  const year = herYear(y, m, d), start = dayNumber(year, BIRTHDAY[0], BIRTHDAY[1]);
  const k = numberedDays(start + 1, dayNumber(y, m, d), dated);   // the days before this one that had a numbered message
  const { order } = yearPlan(year, notes);
  return order[k % order.length].note;   // (more days than messages: they'd start over)
}
function todayDate() {                  // [year, month, day]: today on this phone or computer - or the day in "?date=2026-12-25"
  const q = (new URLSearchParams(location.search).get("date") || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/), now = new Date();
  return q ? [+q[1], +q[2], +q[3]] : [now.getFullYear(), now.getMonth() + 1, now.getDate()];
}
const TODAY = todayDate(), TODAY_KEY = dayKey(TODAY[1], TODAY[2]);   // (the music picks its song by it too)
let MESSAGE_LINES, MESSAGE_MARKS, MESSAGE_FX;   // today's note, line by line; the [marked] stretches of each line; their effect
function setTodaysNote() {
  const note = noteFor(...TODAY);
  MESSAGE_LINES = note.lines; MESSAGE_MARKS = note.marks; MESSAGE_FX = NOTE_EFFECTS[TODAY_KEY] || "pink";
}
{
  const missing = poolsToLookUp(herYear(...TODAY));
  setTodaysNote();                      // straight away, with what's known ...
  if (missing.length) {                 // ... and again once the birthdays we didn't know are looked up (once the page is ready)
    document.addEventListener("DOMContentLoaded", async () => {
      if (!(await lookUpPools(missing))) return;
      if (typeof state !== "undefined" && state.started && !state.paused && state.t >= T_MSG) return;   // (not while it's being typed)
      NOTES.plans = {};
      setTodaysNote();
      if (typeof prepareNote === "function") prepareNote();
    });
  }
}
