# Bug Roster

This document is up-to-date with every bug we have found. Please check this document before filing a bug report.

## Bug #1: X Collisions
TO CREATE: Open level 3, collect the bug in the top left, and hold down right, even after jumping off. You will clip through the grass block.
OS: Chrome OS

## Bug #2: frameCount JavaScript Overload Error
ISSUE: Aw, Snap! Error pops up seemingly randomly after some time of inactivity.
PRESUMED FIX: frameCount value going to high, must keep it from doing this by looping it back around after a full score of 255 may have been counted down.
PRIORITY: Not needed immediately but can be done in free time.
