'use strict';

const story = (() => {
  const choice = (id, label, short, response) => ({ id, label, short, response });
  const ending = (illustration, title, text) => ({ illustration, title, text });

  const chapters = {
    perrault: {
      name: 'Charles Perrault', year: '1697', title: 'The Stranger',
      provision: 'Cakes and a little pot of butter',
      intro: 'Mother sends you to visit Grandmother in the next village with cakes and a little pot of butter. She sets no rule about staying on the path. Near the mill, a wolf greets you as though you were neighbors.',
      lens: 'Whom can you trust?',
      reference: 'Perrault, 1697 · Maria Tatar translation, pp. 11–13',
      sourceEnding: 'Red gives the wolf directions to the first house beyond the mill. He takes the shorter road while she gathers nuts, chases butterflies, and picks flowers. The wolf eats Grandmother and then Red. No rescuer comes.',
      reading: 'The written moral addresses young girls in particular and warns that the most dangerous wolves may sound gentle. The danger begins with a stranger gaining a child’s trust.',
      comparison: 'Perrault’s moral asks children to recognize danger even when it speaks politely.',
      steps: [
        {
          id: 'wolf', place: 'The mill road', title: 'A courteous stranger',
          prompt: 'The wolf asks whether Grandmother lives far away. You know her house is the first one beyond the mill.',
          choices: [
            choice('share', 'Tell him where Grandmother lives', 'Shared the address', 'The wolf leaves for the mill. You can see him take the shorter road toward Grandmother’s house.'),
            choice('private', 'Keep the address to yourself', 'Kept the address private', 'The wolf veers toward the trees and begins searching. He still has to guess which house you mean.')
          ]
        },
        {
          id: 'forest', place: 'The fork', title: 'Two roads',
          prompt: 'One road goes straight to the village. The longer road is full of nuts, butterflies, and flowers. Grandmother is waiting with a place for the cakes and butter.',
          choices: [
            choice('wander', 'Take the longer road and explore', 'Explored the longer road', 'You gather a few nuts and follow a butterfly around the bend. The longer road gives the wolf time to get farther ahead.'),
            choice('direct', 'Walk straight to the village', 'Took the shorter road', 'You turn toward the mill. The short road brings you to the cottage while the lane is still quiet.')
          ]
        },
        {
          id: 'cottage', place: 'Grandmother’s cottage', title: 'A voice behind the door',
          prompt: state => state.cottage === 'wolf'
            ? 'A gruff voice tells you to lift the latch. Grandmother has been ill. The voice could belong to someone with a cold.'
            : 'The latch is down and the window is warm. A soft, muffled voice invites you in. From the doorstep you can see the mill where people are still working.',
          choices: [
            choice('trust', 'Lift the latch and trust the voice', 'Trusted the voice', 'You lift the latch and let the voice guide you inside.'),
            choice('check', 'Question the voice and fetch help', 'Questioned the voice', 'You leave the latch alone and return with a mill worker who knows Grandmother.')
          ]
        }
      ],
      resolve([wolfChoice, route, door]) {
        const wolf = wolfChoice === 'share' ? 'shortcut' : wolfChoice ? 'searching' : 'waiting';
        const cottage = wolfChoice === 'share' && route === 'wander' ? 'wolf' : 'grandmother';
        let result;
        if (door === 'check') {
          result = cottage === 'wolf'
            ? ending('help', 'The latch stays down', 'The mill worker hears the voice and keeps Red outside. The wolf escapes by the back. Grandmother is gone, and Red survives.')
            : ending('help', 'The latch stays down', 'The mill worker recognizes Grandmother’s voice. She opens the door herself, and Red delivers the cakes and butter.');
        } else if (door === 'trust') {
          result = cottage === 'wolf'
            ? ending('dark', 'The cottage falls silent', 'The shortcut brought the wolf to Grandmother first. Red trusts his borrowed voice and the door closes behind her. Neither returns.')
            : ending('visit', 'Cakes on the table', 'Grandmother is still home. Red puts the cakes and butter on the table while the wolf is still outside.');
        }
        return { wolf, cottage, route, door, ending: result };
      }
    },
    grimm: {
      name: 'Jacob and Wilhelm Grimm', year: '1857', title: 'The Lesson',
      provision: 'Cake and wine',
      intro: 'Mother gives you cake and wine. Mind your manners, stay on the path so the bottle won’t break, and say good morning before looking around Grandmother’s parlor.',
      lens: 'What does it mean to learn a rule?',
      reference: 'Grimm, 1857 · D. L. Ashliman translation, tale 26, pp. 140–44',
      sourceEnding: 'Red gives the wolf directions and leaves the path for flowers. The wolf swallows her and Grandmother. A huntsman frees them with scissors, and Red fetches stones to fill the wolf’s belly.',
      reading: 'The first encounter gives obedience a clear purpose. In the second, Red goes straight to Grandmother and shares what she noticed. The two act together.',
      comparison: 'The Grimms give Red an explicit rule, a mistake she can learn from, and a chance to use what she learned.',
      epilogue: {
        title: 'The second wolf',
        text: 'On another visit in the published tale, Red goes straight to Grandmother and warns her. They lock the door. When the wolf climbs onto the roof, Grandmother has Red fill a stone trough with sausage-cooking water. He leans toward the smell, slips off the roof, and drowns. Red walks home safely.'
      },
      steps: [
        {
          id: 'wolf', place: 'The hazel hedge', title: 'Directions under the oaks',
          prompt: 'A wolf greets you and asks where you are going with the cake and wine. Grandmother lives under three large oaks, behind a hazel hedge.',
          choices: [
            choice('share', 'Greet him and give him directions', 'Gave directions', 'The wolf slips along the hazel hedge toward the three oaks. He knows exactly where to turn.'),
            choice('private', 'Keep walking without giving directions', 'Kept walking', 'The wolf drops back. From the brush he watches which way you walk.')
          ]
        },
        {
          id: 'forest', place: 'The flower bank', title: 'A bouquet for Grandmother',
          prompt: 'The wolf points out the flowers and the birdsong. A bouquet would make Grandmother happy. Mother’s rule was to stay on the path and keep the wine bottle safe.',
          choices: [
            choice('wander', 'Step off the path to pick flowers', 'Picked flowers', 'Flowers fill your hand. While you look for one more, the wolf gets ahead and reaches the cottage.'),
            choice('direct', 'Stay on the path as Mother asked', 'Stayed on the path', 'You keep the bottle steady and pass the flower bank. The wolf remains outside as you reach the cottage.')
          ]
        },
        {
          id: 'cottage', place: 'The house beneath the oaks', title: 'Good morning',
          prompt: state => state.cottage === 'wolf'
            ? 'The door is open. You remember to say good morning, but the parlor is silent. Grandmother’s bed curtains are drawn.'
            : 'The door is shut. You remember to say good morning. A familiar voice answers from the parlor.',
          choices: [
            choice('trust', 'Say good morning and enter', 'Greeted and entered', 'You say good morning and cross the threshold.'),
            choice('check', 'Greet her and wait for a clear answer', 'Paused to check', 'You stay on the step long enough to hear who answers.')
          ]
        }
      ],
      resolve([wolfChoice, route, door]) {
        const cottage = route === 'wander' ? 'wolf' : 'grandmother';
        const wolf = cottage === 'wolf' ? 'inside' : wolfChoice === 'share' ? 'hedge' : wolfChoice ? 'trailing' : 'waiting';
        let result;
        if (door && cottage === 'grandmother') {
          result = ending('visit', 'Cake and wine for two', 'Red reaches Grandmother before the wolf and tells her about him. They shut the door together and sit down to share the cake.');
        } else if (door === 'check') {
          result = ending('help', 'The quiet parlor', 'Red hears no answer and calls to a passing huntsman. He rescues Grandmother before Red has to go inside.');
        } else if (door === 'trust') {
          result = ending('rescue', 'A second chance', 'The wolf is waiting behind the curtains. A huntsman hears him snore and frees Red and Grandmother with scissors. Red helps gather the stones.');
        }
        return { wolf, cottage, route, door, ending: result };
      }
    },
    remix: {
      name: 'Original modern remix', year: '1940 & 1982 influences', title: 'A Different Red',
      credit: 'Original modern remix inspired by Thurber and Dahl',
      provision: 'A basket for Grandmother',
      intro: 'Across the wood, a neighbor hangs a lantern beside the familiar lane. A stranger asks where you’re going. You can decide how much he needs to know and what to do when something feels wrong.',
      lens: 'Who gets to act when danger appears?',
      reference: 'James Thurber, 1940 · Roald Dahl, 1982',
      sourceEnding: 'In Thurber’s “The Little Girl and the Wolf,” the girl sees through the disguise and shoots the wolf. In Dahl’s “Little Red Riding Hood and the Wolf,” Red shoots him and later wears his fur as a coat.',
      reading: 'These two parodies reverse the familiar ambush by giving Red the power to act. The game’s invented remix explores that reversal through observation, questions, and a way out.',
      comparison: 'Thurber and Dahl reverse Red’s helplessness. In this remix, she can use what she notices to get herself to safety.',
      steps: [
        {
          id: 'wolf', place: 'The crossing', title: 'A familiar smile',
          prompt: 'The stranger smiles and asks where you’re going. You have seen him by the crossing, but he has never introduced himself.',
          choices: [
            choice('share', 'Answer politely and point out the cottage', 'Answered politely', 'He thanks you and heads toward the cottage. He has time to pull the curtains almost shut.'),
            choice('private', 'Ask why he needs to know', 'Questioned his motive', 'He leaves by the side trail without answering. You remember the way he avoids the question.')
          ]
        },
        {
          id: 'forest', place: 'The lantern lane', title: 'Two ways to pay attention',
          prompt: 'A bright clearing gives you a good view of the ground. On the familiar lane, a neighbor has left a lantern on. Both ways lead to Grandmother’s door.',
          choices: [
            choice('wander', 'Explore the clearing and keep watch', 'Looked for clues', 'Fresh pawprints cross the clearing. You follow them with your eyes and see them turn toward the cottage window.'),
            choice('direct', 'Take the familiar lane past the lantern', 'Passed the neighbor’s light', 'Your neighbor sees you pass and waves. You know where to go if you need another person nearby.')
          ]
        },
        {
          id: 'cottage', place: 'The cottage window', title: 'A borrowed voice',
          prompt: state => {
            const clue = state.clue === 'tracks'
              ? 'The pawprints end at the cottage window.'
              : 'Your neighbor’s lantern is still visible from here.';
            return clue + ' Someone in a cap invites you inside. The voice is close to Grandmother’s, and the ears curve past the seam.';
          },
          choices: [
            choice('trust', 'Give the voice the benefit of the doubt', 'Trusted the disguise', 'You go as far as the threshold and get a closer look at the cap.'),
            choice('check', 'Challenge the disguise and step back', 'Challenged the disguise', 'You ask whose cap he is wearing and back out of reach. His ears come up as the cap falls.')
          ]
        }
      ],
      resolve([wolfChoice, route, door]) {
        const wolf = wolfChoice === 'share' ? 'inside' : wolfChoice ? 'late' : 'waiting';
        const clue = route === 'wander' ? 'tracks' : route === 'direct' ? 'neighbor' : null;
        let result;
        if (door === 'check') {
          result = ending('expose', 'Red names the wolf', clue === 'tracks'
            ? 'Red puts the tracks and the ears together. She calls out the disguise and backs into the clearing, where she can see the trail and get away.'
            : 'Red names the disguise and retreats toward the neighbor’s lantern. The wolf lets the cap fall and flees when he sees two people approaching.');
        } else if (door === 'trust') {
          result = clue === 'tracks' || wolfChoice === 'private'
            ? ending('retreat', 'One step back', 'At the threshold, Red recognizes the stranger from the crossing. She changes her mind, steps back, and gets away while the door is still within reach.')
            : ending('help', 'A light on the lane', 'The wolf moves toward the door. The neighbor calls across the lane, and Red uses the interruption to step back to the light.');
        }
        return { wolf, cottage: wolfChoice ? 'wolf' : 'grandmother', route, clue, door, ending: result };
      }
    }
  };

  function resolveTrail(chapterId, choices) {
    return chapters[chapterId].resolve(choices);
  }

  return { chapters, resolveTrail };
})();

if (typeof module !== 'undefined') module.exports = story;
