import * as randomWords from 'random-words';
import { Event } from 'server/models';

export async function genEventCodes(count: number) {
  let codes = new Array<string>(count).fill('');
  let isValid = false;

  do {
    codes = codes.map(() =>
      randomWords({ exactly: 3, maxLength: 6, join: '-' }),
    );
    const existingEvents = await Event.find({
      attendeePassword: { $in: codes },
      mentorPassword: { $in: codes },
    }).exec();

    if (!existingEvents.length) {
      isValid = true;
    }
  } while (!isValid);

  return codes;
}
