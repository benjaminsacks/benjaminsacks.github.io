/* GFC explainer: practice questions. mc => {q,o[],a,why,hint?}  num => {type:'num',q,a,tol,unit,post,why,hint?} */
(function () {
'use strict';
const Q = GFC.QUIZ;

Q.s0 = [
  { q: 'Which sentence best captures what went wrong?',
    o: ['Banks only lent to rich people, who then stopped paying.',
        'Home loans were repackaged so the risk <em>looked</em> tiny, then hidden inside banks that had borrowed enormous amounts. Then house prices fell.',
        'The government printed too much money and prices rose too fast.',
        'The stock market became overvalued and crashed, dragging housing down with it.'],
    a: 1, why: 'Each step (pooling, slicing, rating, re-slicing, insuring, borrowing) made the risk <em>look</em> smaller, while the real exposure, one giant bet that US house prices would not fall, kept growing.' },
  { q: 'Which is the correct order for how one mortgage travels through the machine?',
    o: ['CDO → MBS → Mia\'s loan → rating agency',
        'Rating agency → Mia\'s loan → Lehman → AIG',
        'MBS → CDS → mortgage → CDO',
        'Mia\'s loan → pooled into an MBS → riskiest slices repackaged into a CDO → insured with credit default swaps'],
    a: 3, why: 'Loan → pool (MBS) → slices (tranches) → the leftover BBB slices repackaged (CDO) → insurance (CDS) bought on the result. We build each step one at a time below.' }
];

Q.s1 = [
  { type: 'num', q: 'A $400,000 house, 5% down payment. How much does the buyer borrow?', unit: '$', a: 380000, tol: 1,
    why: '5% of $400,000 is $20,000 down. $400,000 − $20,000 = <b>$380,000</b> borrowed.' },
  { type: 'num', q: 'Mia\'s home was worth $300,000 and she owes $285,000. Prices fall 10%. What is her equity now? (Use a negative number if she is underwater.)', unit: '$', a: -15000, tol: 1,
    why: 'The house is now worth $270,000. $270,000 − $285,000 = <b>−$15,000</b>. She is underwater: she owes more than the house is worth.' },
  { type: 'num', q: 'Use the calculator: $300,000 house, 20% down, 6% rate, 30 years. What is the monthly payment (nearest dollar)?', unit: '$', a: 1439, tol: 3,
    why: 'Loan = $240,000. The payment formula gives about <b>$1,439</b> a month, and over 30 years you\'d pay roughly $278,000 in interest, more than the loan itself.' },
  { q: 'In year 1 of a 30-year mortgage, most of each payment goes to...',
    o: ['Paying down the amount borrowed (principal)', 'Interest', 'Property taxes', 'Fees to the lender'],
    a: 1, why: 'Interest is charged on the whole balance, which is largest at the start. Equity builds slowly early on, which is why a small price drop can wipe it out.' },
  { q: 'Why was the "2/28 ARM" so dangerous for families like Mia and Sam?',
    o: ['The rate was high for the entire 30 years.',
        'After a low 2-year teaser rate the payment jumped, and the escape plan was to refinance, which only works if the house has risen in value.',
        'Banks could take the house at any time during the first two years.',
        'The loan had to be repaid in full after two years.'],
    a: 1, why: 'The teaser payment was what got people approved. The "plan" was to refinance before the reset using their new equity. When prices stopped rising, the exit door closed.' }
];

Q.s2 = [
  { type: 'num', q: 'Fee: $4,000. Loss if the borrower defaults: $90,000. A lender <b>keeps</b> a loan with a 15% chance of default (ignore interest income). What is its expected profit per loan?', unit: '$', a: -9500, tol: 1,
    why: '$4,000 − 0.15 × $90,000 = $4,000 − $13,500 = <b>−$9,500</b>. A lender that keeps the risk would refuse this loan. A lender that sells it pockets the +$4,000 and doesn\'t care.' },
  { q: 'What really changed when lenders began selling nearly every loan to Wall Street within weeks?',
    o: ['Interest rates became illegal to change.', 'The lender\'s profit came from <em>how many</em> loans it made, not from whether they were repaid.', 'Borrowers had to prove more income.', 'The government guaranteed every loan.'],
    a: 1, why: 'Pay depends on volume + the person who eventually owns the loan bears the loss. That\'s the incentive problem at the heart of "originate-to-distribute".' },
  { q: 'A "NINJA" loan went to a borrower with...',
    o: ['No Interest, No Jargon, Approved', 'No Income, No Job, no Assets', 'Nearly Insured, Not Just Approved', 'No Insurance, No Joint account'],
    a: 1, why: 'Yes, this was a real industry nickname. The lender didn\'t verify income or assets, because someone else would be holding the loan.' },
  { q: 'A broker earned more by steering a borrower into a higher-rate loan than one they qualified for at a lower rate. What problem is this?',
    o: ['Misaligned incentives: paid for closing the loan, not for whether it gets repaid', 'Inflation', 'A tax loophole', 'Overly strict regulation'],
    a: 0, why: 'This is the "yield spread premium". Many borrowers who qualified for prime loans were placed in subprime ones.' }
];

Q.s3 = [
  { q: 'Once Mia\'s loan sits inside an MBS, who ultimately receives the interest and principal she pays each month?',
    o: ['Countrywide, forever', 'The bondholders who own slices of the trust (the servicer just collects and passes it on)', 'The government', 'Moody\'s'],
    a: 1, why: 'The servicer is a middleman collecting checks. The trust passes the cash to the bondholders according to its rules, which is the next section.' },
  { q: 'In the pool simulator (5% chance each loan defaults, independently), what happens as you go from 10 loans to 1,000 loans?',
    o: ['Nothing changes.', 'The default rate of the pool clusters tightly around 5%. Outcomes become very predictable.', 'The average default rate rises.', 'The outcomes spread out more.'],
    a: 1, why: 'This is the law of large numbers. Pooling thousands of <em>independent</em> loans turns a risky individual bet into a predictable one. That was the entire sales pitch of MBS.' },
  { q: 'What does pooling NOT protect you from?',
    o: ['One borrower losing his job', 'One neighborhood having a bad year', 'Every borrower failing for the <em>same</em> reason at once, like house prices falling nationwide', 'Late payments by a few households'],
    a: 2, why: 'Diversification only works if loans are (mostly) independent. A nationwide price decline is one shared cause, and later you\'ll see what that does.' },
  { q: 'What is the key difference between agency MBS (Fannie/Freddie) and private-label MBS (Lehman, Countrywide, Bear...)?',
    o: ['Agency MBS carry a Fannie/Freddie guarantee against borrower default; private-label investors take the credit risk themselves.',
        'Private-label MBS were guaranteed by the Treasury.',
        'Agency MBS only held subprime loans.',
        'There is no difference.'],
    a: 0, why: 'Private-label deals (which funded most subprime and Alt-A loans) had no guarantee, so investors relied on tranching and the ratings to feel safe.' }
];

Q.s4 = [
  { type: 'num', q: 'A $500M pool has Equity 5% / BBB 5% / Mezzanine 10% / AAA 80%. Losses total $35M (7%). How many <b>$ millions</b> does the BBB tranche lose?', unit: '$', post: 'million', a: 10, tol: 0.1,
    why: 'Equity absorbs the first 5% ($25M). The next 2% ($10M) hits the BBB tranche, which covers losses from 5% to 10%. <b>$10M</b> lost (40% of its $25M).' },
  { type: 'num', q: 'Pool losses hit 12%. What <b>percent</b> of the Mezzanine tranche (which covers losses from 10% to 20%) is wiped out?', post: '%', a: 20, tol: 0.5,
    why: 'Mezzanine absorbs the losses between 10% and 20%. Losses of 12% means 2 of its 10 points are gone: 2 ÷ 10 = <b>20%</b>.' },
  { q: 'Why did AAA tranches pay a lower interest rate than BBB tranches?',
    o: ['They were riskier.', 'They were last in line to absorb losses, so investors accepted less yield for more safety.', 'The government taxed them.', 'They were shorter bonds.'],
    a: 1, why: 'Risk and reward. The AAA investor is paid first and loses last, so demands less. The BBB investor needs a higher yield as compensation.' },
  { q: 'Moody\'s and S&P were paid for their ratings by...',
    o: ['The investors who bought the bonds', 'The government', 'The banks that created and sold the bonds', 'Homeowners'],
    a: 2, why: '"Issuer pays" created a conflict: banks could shop around for the agency that would give the highest rating, and the agencies earned huge fees from structured finance.' },
  { q: 'In the correlation simulator, moving from ρ = 0.05 to ρ = 0.30 (same average default rate) mainly...',
    o: ['Lowers the average loss.', 'Makes extreme, pool-wide disasters far more likely, even though the <em>average</em> is unchanged.', 'Has no effect on the senior tranches.', 'Makes the pool safer.'],
    a: 1, why: 'Correlation is how "tied together" the loans are. Raise it, and the loans stop being independent coin flips and start behaving like one big bet. The AAA tranche goes from "essentially never hit" to "plausibly hit".' }
];

Q.s5 = [
  { q: 'Why did Wall Street build CDOs out of BBB slices?',
    o: ['BBB slices were hard to sell; repackaging let ~75% of the new pile earn a AAA rating, creating new buyers (and new fees).',
        'The government required it.',
        'BBB slices paid no interest.',
        'To make mortgages cheaper for borrowers.'],
    a: 0, why: 'Those slices were the leftovers nobody wanted. The CDO "alchemy" turned the leftovers into mostly AAA bonds. The machine could keep buying risky mortgages.' },
  { type: 'num', q: 'If the underlying subprime pool loses 8%, what <b>percent</b> of each BBB tranche (which covers 5%–10%) is wiped out?', post: '%', a: 60, tol: 0.5,
    why: '8% − 5% = 3 points hit, out of a 5-point-wide tranche: 3 ÷ 5 = <b>60%</b>.' },
  { type: 'num', q: 'A CDO holds only those BBB tranches, so its pool loses 60%. Its AAA tranche begins losing at 25% and is gone at 100%. What <b>percent</b> of the "AAA" CDO tranche is lost? (nearest %)', post: '%', a: 47, tol: 1,
    why: '(60 − 25) ÷ (100 − 25) = 35 ÷ 75 ≈ <b>47%</b>. A mere 8% loss on the original mortgages destroyed nearly half of a "AAA" bond.' },
  { q: 'What is the flaw in assuming a CDO is "diversified" because it holds slices from 100 different mortgage deals?',
    o: ['There was no flaw.', 'All 100 deals depend on the same thing: American house prices, so they fail together.', 'The deals were too small.', 'They were all from the same bank.'],
    a: 1, why: 'Different deal names, same underlying bet. Diversification across deals is worthless if they\'re all exposed to the same risk.' },
  { q: 'How were CDO managers like Wing Chau largely paid?',
    o: ['Only if the CDO performed well for 30 years', 'Fees tied to the size of the CDOs they managed, so more deals meant more income, whatever happened later', 'A fixed government salary', 'By the homeowners'],
    a: 1, why: 'When you earn more by <em>doing more deals</em>, quality control is nobody\'s priority. The same incentive problem keeps reappearing at every layer.' }
];

Q.s6 = [
  { q: 'A credit default swap (CDS) is best described as...',
    o: ['A bond that pays higher interest', 'An insurance-like contract: you pay a premium and the seller pays you if a bond loses value (and you don\'t even need to own the bond)', 'A loan between two banks', 'A type of mortgage'],
    a: 1, why: 'The seller collects small regular premiums and promises a big payout if things go wrong. AIG sold huge amounts of this.' },
  { type: 'num', q: 'AIG sold protection on $78 billion of CDOs for a premium of 0.1% per year. How many <b>$ millions</b> in premiums does it collect over 3 years?', unit: '$', post: 'million', a: 234, tol: 1,
    why: '$78,000M × 0.001 × 3 = <b>$234 million</b>. Real money, but tiny relative to the risk.' },
  { type: 'num', q: 'If those CDOs lose 40% of their value, how many <b>$ billions</b> does AIG owe?', unit: '$', post: 'billion', a: 31.2, tol: 0.1,
    why: '40% × $78B = <b>$31.2 billion</b>, which is more than 100× the premiums collected. A classic "collect pennies, owe millions" bet.' },
  { q: 'Why did AIG\'s collapse threaten other banks?',
    o: ['Banks owned AIG shares.', 'Banks had bought AIG\'s promise as protection. If AIG couldn\'t pay, those hedges (and the banks\' reported safety) would vanish at once.', 'AIG was the largest mortgage lender.', 'It wasn\'t a threat.'],
    a: 1, why: 'AIG was a hub: lots of banks were relying on the same insurer. Its failure would have turned many banks\' "hedged" positions into unhedged losses overnight.' }
];

Q.s7 = [
  { type: 'num', q: 'A bank is levered 30:1 ($30 of assets for every $1 of its own money). By what <b>percent</b> must its assets fall to wipe out its equity? (one decimal)', post: '%', a: 3.3, tol: 0.1,
    why: '1 ÷ 30 = <b>3.3%</b>. At 30:1 a drop in asset values of just over 3% and the bank owes more than it owns.' },
  { type: 'num', q: 'At 30:1 leverage, the bank\'s assets <em>rise</em> 2%. What is its return on equity (in percent)?', post: '%', a: 60, tol: 0.5,
    why: '2% × 30 = <b>60%</b>. That\'s why leverage was so tempting: tiny gains became huge profits (and bonuses). The same math applies on the way down.' },
  { q: 'Repo ("repurchase agreement") is best described as...',
    o: ['A long-term mortgage', 'Short-term (often overnight) borrowing secured by bonds, renewed again and again', 'A government subsidy', 'A type of stock'],
    a: 1, why: 'It\'s like a pawn shop that you visit every morning. Fine as long as lenders keep rolling the loan.' },
  { q: 'Why can a repo "run" force a bank into fire sales?',
    o: ['Lenders refuse to renew the overnight loans, so the bank must sell assets immediately to repay, pushing prices down further and scaring the next lenders.',
        'The Fed prohibits holding bonds.', 'Customers withdraw their savings from ATMs.', 'The stock market closes.'],
    a: 0, why: 'This is a self-reinforcing spiral: falling prices → bigger haircuts/margin calls → forced selling → falling prices.' }
];

Q.s8 = [
  { q: 'Why did the whole machine depend on rising house prices?',
    o: ['Rising prices gave borrowers equity to refinance or sell instead of defaulting, and made the collateral look safe.', 'Rising prices raised interest rates.', 'Rising prices made the loans bigger.', 'It didn\'t.'],
    a: 0, why: 'A borrower who can\'t pay can sell or refinance if the house is worth more than the loan. Take away the rising prices and defaults skyrocket.' },
  { q: 'What did the Fed do with its interest-rate target from 2004 to 2006, and why did it matter for borrowers?',
    o: ['Cut it to 0%, making loans free', 'Raised it from 1% to 5.25%, which pushed up payments on adjustable-rate loans', 'Left it unchanged', 'Abolished it'],
    a: 1, why: 'Short-term rates feed the formulas for ARMs. As rates rose, resets hit harder, and the first big wave of resets landed in 2007 with house prices already sliding.' },
  { q: 'Which order is correct?',
    o: ['Lehman bankruptcy → New Century bankruptcy → Bear Stearns hedge funds collapse', 'Bear Stearns hedge funds collapse → Lehman bankruptcy → New Century bankruptcy', 'New Century bankruptcy (Apr 2007) → Bear Stearns hedge funds collapse (Jun–Jul 2007) → Lehman bankruptcy (Sep 2008)', 'All happened the same week'],
    a: 2, why: 'The crisis was slow-motion before it was fast: about 18 months passed between the first lenders failing and Lehman.' },
  { q: 'The worst loans in many mortgage pools were made in 2006–2007 because...',
    o: ['Wall Street\'s demand for new loans was so strong that, once qualified borrowers were used up, standards kept falling to keep the supply coming.', 'Rates were at their lowest then.', 'The government mandated them.', 'Borrowers got more careful.'],
    a: 0, why: 'The machine needed fuel. The marginal borrower in 2006 was far riskier than the average borrower in 2001, and the pool\'s ratings didn\'t account for that.' }
];

Q.s9 = [
  { q: 'Bear Stearns collapsed in March 2008 mainly because...',
    o: ['Its customers withdrew cash from ATMs.', 'Its short-term lenders stopped rolling over its repo loans: a modern bank run.', 'It was found guilty of fraud.', 'Its mortgages all defaulted in one week.'],
    a: 1, why: 'Bear\'s cash cushion fell from about $18 billion to about $2 billion in a matter of days as lenders and clients pulled out.' },
  { q: '"Breaking the buck" (Reserve Primary Fund, Sept 16, 2008) means...',
    o: ['A money-market fund\'s shares fell below $1.00, so savers lost principal in what they thought was a cash-like account.', 'A bank ran out of dollar bills.', 'The dollar fell against the euro.', 'A fund beat the market.'],
    a: 0, why: 'The fund held Lehman IOUs. Investors then yanked hundreds of billions from similar funds, which hit companies that depended on them for short-term loans.' },
  { q: 'Which statement is TRUE about the weekend of Sept 13–15, 2008?',
    o: ['Lehman got a government bailout.', 'Lehman filed for bankruptcy, and Merrill Lynch agreed to be bought by Bank of America.', 'Bear Stearns failed.', 'AIG paid back its loans.'],
    a: 1, why: 'Merrill, facing the same kind of losses as Lehman, sold itself that weekend. Lehman was left without a buyer or a rescue and filed on Monday, Sept 15.' },
  { q: 'When the LIBOR–OIS spread (a gauge of bank-to-bank distrust) jumped from about 0.1% to about 3.5%, it meant...',
    o: ['Banks trusted each other more than ever.', 'Banks were so afraid of each other\'s hidden losses that they would only lend to each other at much higher rates, or not at all.', 'The Fed cut rates.', 'Oil prices spiked.'],
    a: 1, why: 'When no one knows which banks are broke, no one lends to any bank. Credit froze, which is how Wall Street\'s mess reached Main Street.' }
];

Q.s10 = [
  { q: 'Economists often describe mortgage default as a "double trigger". What are the two triggers?',
    o: ['High interest rate + high taxes', 'Negative equity (owing more than the house is worth) + a payment shock such as job loss or an ARM reset', 'Divorce + a new baby', 'Rising prices + falling prices'],
    a: 1, why: 'With positive equity, a struggling owner can sell. Only when they\'re underwater <em>and</em> can\'t afford the payment do they default. You can reproduce this in Mia\'s story above.' },
  { type: 'num', q: 'Pew found median wealth of Hispanic households fell 66% between 2005 and 2009. If a household started with $20,000, how many dollars were left?', unit: '$', a: 6800, tol: 50,
    why: '$20,000 × (1 − 0.66) = <b>$6,800</b>. For families with little wealth outside their home, falling house prices were devastating.' },
  { q: 'Which people were hurt even if they always paid their mortgage on time?',
    o: ['None, since they paid on time', 'Many: neighbors\' foreclosures cut local home values, jobs disappeared, retirement accounts fell, and credit tightened', 'Only bank shareholders', 'Only renters'],
    a: 1, why: 'The crisis spread through falling prices, lost jobs, shrinking 401(k)s, and frozen credit. The channels reached nearly everyone.' },
  { q: 'Compared to what Wall Street received, relief for ordinary homeowners was...',
    o: ['Larger', 'Smaller and slower. Programs like HAMP reached far fewer people than promised, while bank rescues were fast and enormous.', 'Identical', 'Nonexistent'],
    a: 1, why: 'Policymakers were focused on stopping the financial panic; homeowner programs were underused and often frustrating to navigate. This still shapes how people view the response.' }
];

Q.s11 = [
  { q: 'Which of these was NOT a major link in the chain that caused the crisis?',
    o: ['Lenders selling loans without keeping any risk', 'Rating agencies assuming house prices would not fall everywhere at once', 'Banks borrowing about $30 for every $1 of their own money', 'Households suddenly deciding to borrow far less in 2005'],
    a: 3, why: 'The opposite happened. Borrowing exploded, encouraged by loose lending and rising prices.' },
  { q: 'Where did the biggest "multiplier" of losses come from?',
    o: ['Interest on credit cards', 'Layers: tranching, CDOs-of-slices, insurance, and leverage turned modest mortgage losses into catastrophic losses on top-rated securities', 'The stock market', 'Foreign currency'],
    a: 1, why: 'Each layer magnified a small loss at the bottom: BBB slices, then CDO "AAA" slices, then 30:1 bank leverage, then forced selling.' },
  { q: 'When Mia stops paying her mortgage, who feels it FIRST in her MBS?',
    o: ['The AAA bondholders', 'The equity (first-loss) holders, then the BBB tranche, working upward', 'Moody\'s', 'Nobody, because of insurance'],
    a: 1, why: 'Losses climb the tower from the bottom. The AAA investor is only hurt after everyone beneath is wiped out, which is what the CDO example showed.' },
  { type: 'num', q: 'Final calculation. A subprime pool loses 9%. What <b>percent</b> of its BBB tranche (5%–10%) is wiped out?', post: '%', a: 80, tol: 0.5,
    why: '(9 − 5) ÷ 5 = <b>80%</b>. And a CDO built from those BBB slices would have lost 80% overall, wiping out its AAA tranche by (80 − 25) ÷ 75 ≈ 73%. You just did the core math of the crisis.' },
  { q: 'After the crisis, a rule (Dodd-Frank "skin in the game") required most securitizers to keep about 5% of the risk. Which problem does that target?',
    o: ['Inflation', 'Originate-to-distribute: the lack of any incentive to check loan quality when you pass the risk along', 'Stock-market volatility', 'Interest rates'],
    a: 1, why: 'If you must hold some of what you sell, you have a reason to care whether it works.' }
];
})();
