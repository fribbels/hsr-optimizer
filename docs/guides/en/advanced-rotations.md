# Advanced Rotations User Guide

The advanced rotations menu gives full control over activating conditional effects when optimizing a character's Combo
DMG. This page assumes familiarity with the optimizer, but if you're looking to get started with the optimizer first,
check out the Getting Started tab on the menu sidebar.

This guide will describe how a custom Jingliu ability rotation with a -1 speed Bronya team can be defined in this menu.

![image](https://github.com/user-attachments/assets/06ba1580-e4d0-449b-b523-bb703aba475d)

## Simple vs Advanced mode

The two modes which can be selected from the Combo DMG calculation menu are Simple vs Advanced. The rotation
customization menu can only be accessed when selecting the Advanced mode.

- Simple mode
  - Most buffs are considered as full uptime, however the optimizer will automatically try to precompute when some buffs
    should be disabled
- Advanced mode
  - Open the Advanced rotation menu for full control over character / light cone / teammate / set effects buff uptime
  - Buff values can be changed between abilities
  - The optimizer will automatically try to precompute when some buffs should be disabled

Advanced mode is powerful but should be used with care, as it requires an in depth understanding of buff timings in
combat to use correctly.

![image](https://github.com/user-attachments/assets/d93b4d9c-72a9-4847-b4f4-42e424896b5a)

## Combo abilities

The primary abilities are Basic / Skill / Ult / Fua attacks. Defaults are set per character but abilities can be added (
maximum 8) or removed (minimum 1).

In the Advanced menu, the character abilities are shown in the header, and the rotation can be modified with the
selectors.

![image](https://github.com/user-attachments/assets/ede1ea9e-1cd9-4749-b063-deb4b5496588)

## DoT / Break

DoT and Break triggers are not impacted by the advanced rotation, as their timings are difficult to control in actual
battles.
They are calculated using the main optimizer page's damage conditionals.
DoT / Break damage can be added to the rotation menu and the damage is multiplied by their defined stack counts.

Note: This Break limitation only applies to the Weakness Break trigger, and does not apply other sources of Break damage
such as Super Break or Boothill's enhanced basic.

## Buff activations

Each row of the chart represents a buff source, whether it be a character ability / light cone / teammate / set effect /
etc.
Each column represents the character's action using the selected ability. The color of each block represents whether
that row's buff is active during the ability.

The first column is locked and represents the main optimizer page's state. It can be changed with the conditional
sliders / switches.
These will affect the character's Combat Stats calculation, and the damage of their DoT and Break triggers, but not the
ability damage.

In the previous Jingliu example, she is in her unenhanced state during her first two actions.
The Enhanced State and E1 blocks remain deactivated until the third action when she uses Ult.

## Buff partitions

Certain buffs which can have multiple values are represented with sliders on the main optimizer page.
In the Advanced menu, they are shown as blocks with a darker shading with a + / - icon.

![image](https://github.com/user-attachments/assets/ebca4a73-2dc7-4fa4-b53b-b1736f2e1045)

Using the + button will add a partition to the buff and the - button will remove one.
Partitioned buffs can change their value over multiple actions, but must always only have one activated value per
action.

During Jingliu's first two turns, we assume no teammates lost health, so we add a 0 stack partition for her signature
light cone's Eclipse stacks.
On her third action after her talent triggers during Ult, she will activate the light cone fully, and we switch back to
the 3 stack partition.

## Set effects

Relic and ornament effects can be added to the display. Any sets activations that don't match the optimizer preset will
be shown by default.
At the time of writing, this probably includes Scholar Lost in Erudition for example as the optimizer automatically
adjusts that set's activations based on action order.

![image](https://github.com/user-attachments/assets/bc0f3692-9b01-459b-bcb0-81a03e74c9b8)

Hunter of Glacial Forest and Scholar Lost in Erudition activations are changed here to represent their buff uptime in
battle for a more accurate damage comparison.
Rutilant Arena's buff is static as its effect is automatically triggered depending on the character's Combat Stats crit
rate during that action.

## Teammates

Each teammate's buffs can also be controlled, as well as their worn relic / ornament set effects.

![image](https://github.com/user-attachments/assets/25caecb5-6bc7-4dee-afa4-ca197e53aebd)

Bronya's effects here are updated to represent her buff uptimes on Jingliu actions as Bronya uses Skill & Ult.

Notably the E2 Skill SPD buff and Talent's Initial DEF buff are deactivated on the main optimizer page but their effects
can still be considered for Combo DMG.
This can be useful for techniques or brief uptime abilities.
The E2 SPD buff should be disabled for first turn speed tuning purposes, but it can affect damage by triggering SPD
based conditionals such as the Glamoth set.

## Calculations

Each ability's damage is calculated with its respective buff activations, then summed together with the DoT and Break
stacks.
The result is shown in the optimizer's Combo DMG column.

![image](https://github.com/user-attachments/assets/33114e8d-9229-4e35-88fe-3f3412e6979a)
