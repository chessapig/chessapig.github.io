---
layout: blog 
title:  "Stick bombs"
date:   2022-11-04 16:03:47 -0500
categories: talk
tags: [talk, fun]
talk-type: seminar
image: /assets/images/sticks.jpg
file:
talk-venue: UC Berkeley Many cheerful facts, fall 2022
summary: Weave together 4 or 5 popsicle sticks in the right way, and you get a flat rigid pattern -- until you drop it. The fast-released elastic energy shoots apart the popsicle sticks, producing a *stick bomb*. Join us as we try and discover the mathematics behind stick bombs, what makes them stay together and what makes them fall apart. Working together in groups, we'll come up with Many of our own Cheerful Facts about tounge-depresser trajectiles :)
---
![](/assets/images/sticks.jpg)
weave together 4 or 5 popsicle sticks in the right way, and you get a flat rigid pattern -- until you drop it. The fast-released elastic energy shoots apart the popsicle sticks, producing a *stick bomb*. This talk was almost entirely hands off, I split people into groups, gave them a bunch of popsicle sticks, and had them discover the mathematics behind stick bombs. I gave this activity to a room full of math grad students, and it totally killed. People were still discussing their ideas for days afterwards. There is a surprising amount of combinatorial depth contained in stick bombs. I don't know how deep the rabbit hole goes, but after an hour or two of playing around with sticks, you'll realize how very far you are from the bottom. 

<div centering>
<video width="50%" preload muted autoplay controls>
    <source src="/assets/images/exploding_sticks.mp4" type="video/mp4">
</video></div>

Here's a few of the leading questions I used to guide people along. A very important aspect of these questions is to figure out how to make them well defined and turn them into math.

- What is the fewest number of sticks needed for a stick bomb?
	- Answer: 4
- How many 5-stick stick bombs are there?
	- Answer: 4, perhaps a few more depending on which stick bombs you call equivalent.
- How do you combinatorially describe stick bombs?
- When is a combinatorial stick bomb stable, like when can you pick it up by any stick and wave it around?
- When is a combinatorial stick bomb primed to explode? As in, when will removing one connection cause the stick bomb to be unstable?
	- This gives a notion of *minimality* to stick bomb configurations, which provides a lot of combinatorial depth. My audience was familiar with knot theory, so they quickly related it to notions of prime knots, connected sums, and Reidemeister moves.
- Can you have minimal stick bombs of arbitrary size?
	- Answer: It's fun to come up with a way to construct stick bombs of arbitrary size. There are many ways to do this. You can make ones based off polygons of arbitrary many sides, or you can use a [cobra weave](https://www.youtube.com/watch?v=17V8zNYMw88&ab_channel=J%C3%BCrgenRichter-Gebert)


This is probably the topic of a whole other talk, but the preexisting literature on stick bombs is really cool. They sit at the intersection between math, art, and structural engineering, where they are called *Grillages*. The literature is less about combinatorics, and more the static equilibrium. The forces between all of the sticks is stuck in a giant matrix, and the rank and corank of this matrix tell us wether the stick bombs are stable or not. Moreover, these static equilibria are preserved under projective transforms, making projective geometry the natural setting of popsicle stick math. This lets us apply projective duality, which switches points in $\mathbb{R}^2$ to lines in $\mathbb{R}^2$ and vice versa. This converts grillage structures to *Tensegrities*, rigid objects made out of pure tension components (strings) and pure compression components (rods).  For the structural engineering/math perspective, see the [Duality between plane trusses and grillages](https://www.sciencedirect.com/science/article/pii/002076838990108X?via%3Dihub), especially section 5, . For the art perspective, see [this presentation](http://kennethsnelson.net/Tensegrity_and_Weaving.pdf). 
![](/assets/images/popsicle_sticks_and_tensegrities.png)
Another cool fact, the stick bomb exploding mechanism is used by biology. Microtubules, the skeleton of our cells, are perpetually under stress like a woven cylinder of sticks. This way, when the cap falls out, it quickly unravels in what's called a microtubule catastrophe. This is essential in freeing up unused microtubule parts for new microtubules. See [this paper](https://www.cell.com/trends/cell-biology/pdf/S0962-8924(15)00160-9.pdf), and [this video](https://www.youtube.com/watch?v=21P100yiEN8&ab_channel=SaadDeenYamlikha)