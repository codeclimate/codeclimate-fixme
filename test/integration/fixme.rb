#####################################################################
#####################################################################
## Integration tests for this engine must escape uses of the magic
## keywords, otherwise the engine will flag additional issues on the
## lines with the test markers themselves. We use backslash escaping
## to avoid this problem.
#####################################################################
#####################################################################

# [issue] check_name="F\IXME" description="F\IXME found" category="Bu\g Risk"
# FIXME: This is broken
x = x

############################

foo = $stdin.gets
# [issue] check_name="B\UG" description="B\UG found" category="Bu\g Risk"
# BUG: This should use double equals
if (foo = "foo")
  puts "You said foo"
end

############################

foo = $stdin.gets
# [issue] check_name="X\XX" description="X\XX found" category="Bu\g Risk"
# XXX: This should use double equals
if (foo = "foo")
  puts "You said foo"
end

############################

# [issue] check_name="T\ODO" description="T\ODO found" category="Bu\g Risk"
# TODO: Add more tests

############################

# [issue] check_name="H\ACK" description="H\ACK found" category="Bu\g Risk"
# HACK
instance_eval "CRAZY STUFF"
