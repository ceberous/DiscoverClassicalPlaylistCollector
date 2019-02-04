#!/bin/bash
echo "smembers 'DISCOVERCLASSICAL.SONGS'" | redis-cli -n 3 > songs_base64.txt
#perl -MMIME::Base64 -ne 'print decode_base64($_);print "\n"' songs_base64.txt > songs.txt
perl -MMIME::Base64 -ne 'my $lines =  decode_base64($_); my @values = split( "---" , $lines ); foreach my $val (@values){print "$val ";}print "\n";' songs_base64.txt > songs.txt
perl -MMIME::Base64 -ne 'my $lines =  decode_base64($_); my @values = split( "---" , $lines ); print @values[0]; print " "; print @values[1];print "\n";' songs_base64.txt > songs_simple.txt
#perl -MMIME::Base64 -ne 'my $lines =  decode_base64($_); my @values = split( "---" , $lines ); @values[0] =~s/&|\.|\,|(\(Part.*?)\)|Pt/g; @values[1] =~s/&|\.|\,|(\(Part.*?)\)|Pt/g; print @values[0]; print " "; print @values[1];print "\n";' songs_base64.txt > songs_simple.txt

# split -l 500 -d songs_simple.txt

# /&|\.|\,|(\(Part.*?)\)|Pt/g
# Dueling Banjos Eric Weissberg & Steve Mandell
# Six Three Four Five Seven Eight Nine Wilson Pickett
# Once Upon A Time Marvin Gaye & Mary Wells
# Lookin' For Boys Pin Ups
# The Sun Ain't Gonna Shine (Anymore) Walker Brothers
# The Bertha Butt Boogie, Pt. 1 Jimmy Castor Bunch
# Moon Walk (Part 1) Joe Simon
# Bluebird Paul McCartney & Wings