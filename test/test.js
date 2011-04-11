module("Class.create");

(function($) {
  
  test("Creation", function() {
    ok($.isFunction(Animal), "Animal is not a constructor");
    same(Animal.subclasses, [Cat, Mouse, Dog, Ox]);
    $.each(Animal.subclasses, function(i, subclass) {
      equals(subclass.superclass, Animal);
    });

    var Bird = Class.create(Animal);
    equals(Animal.subclasses[Animal.subclasses.length - 1], Bird);
    // for..in loop (for some reason) doesn't iterate over the constructor property in top-level classes
    same(Class.keys(new Animal).sort(), Class.keys(new Bird).sort());
  });
  
  
  test("Instantiation", function() {
    var pet = new Animal("Nibbles");
    equals(pet.name, "Nibbles", "property not initialized");
    equals(pet.say("Hi!"), "Nibbles: Hi!");
    equals(Animal, pet.constructor, "bad constructor reference");
    ok(!pet.superclass);

    var Empty = Class.create();
    equals(typeof(new Empty), "object");
  });
  
  
  test("Inheritance", function() {
    var tom = new Cat("Tom");
    equals(tom.constructor, Cat, "bad constructor reference");
    equals(tom.constructor.superclass, Animal, "bad superclass reference");
    equals(tom.name, "Tom");
    equals(tom.say('meow'), "Tom: meow");
    equals(tom.eat(new Animal), "Tom: Yuk! I only eat mice.");
  });
  
  
  test("Superclass Method Call", function() {
    var tom = new Cat("Tom");
    equals(tom.eat(new Mouse), "Tom: Yum!");

    // augment the constructor and test
    var Dodo = Class.create(Animal, {
      initialize: function($super, name) {
        $super(name);
        this.extinct = true;
      },

      say: function($super, message) {
        return $super(message) + " honk honk";
      }
    });

    var gonzo = new Dodo("Gonzo");
    equals(gonzo.name, "Gonzo");
    ok(gonzo.extinct, "Dodo birds should be extinct");
    equals(gonzo.say("hello"), "Gonzo: hello honk honk");
  });
  
  
  test("Add Methods", function() {
    var tom   = new Cat("Tom");
    var jerry = new Mouse("Jerry");

    Animal.addMethods({
      sleep: function() {
        return this.say("ZZZ");
      }
    });

    Mouse.addMethods({
      sleep: function($super) {
        return $super() + " ... no, can't sleep! Gotta steal cheese!";
      },
      escape: function(cat) {
        return this.say("(from a mousehole) Take that, " + cat.name + "!");
      }
    });

    equals(tom.sleep(), "Tom: ZZZ", "added instance method not available to subclass");
    equals(jerry.sleep(), "Jerry: ZZZ ... no, can't sleep! Gotta steal cheese!");
    equals(jerry.escape(tom), "Jerry: (from a mousehole) Take that, Tom!");
    // insure that a method has not propagated *up* the prototype chain:
    ok(!tom.escape);
    ok(!new Animal().escape);

    Animal.addMethods({
      sleep: function() {
        return this.say('zZzZ');
      }
    });

    equals(jerry.sleep(), "Jerry: zZzZ ... no, can't sleep! Gotta steal cheese!");
  });
  
  
  test("Base Class With Mixin", function() {
    var grass = new Plant("grass", 3);
    ok($.isFunction(grass.getValue));
    equals(grass.inspect(), "#<Plant: grass>");
  });
  
  
  test("Subclass With Mixin", function() {
    var snoopy = new Dog("Snoopy", 12, "male");
    ok($.isFunction(snoopy.reproduce));
  });
  
  
  test("Subclass With Mixins", function() {
    var cow = new Ox("cow", 400, "female");
    equals(cow.inspect(), "#<Ox: cow>");
    ok($.isFunction(cow.reproduce));
    ok($.isFunction(cow.getValue));
  });
  
  
  test("Class With toString And valueOf Methods", function() {
    var Foo = Class.create({
      toString: function() { return "toString" },
      valueOf: function() { return "valueOf" }
    });
    
    var Bar = Class.create(Foo, {
      valueOf: function() { return "myValueOf" }
    });

    var Parent = Class.create({
      m1: function(){ return 'm1' },
      m2: function(){ return 'm2' }
    });
    var Child = Class.create(Parent, {
      m1: function($super) { return 'm1 child' },
      m2: function($super) { return 'm2 child' }
    });

    ok(new Child().m1.toString().indexOf("m1 child") > -1);

    equals(new Foo().toString(), "toString");
    equals(new Foo().valueOf(), "valueOf");
    equals(new Bar().toString(), "toString");
    equals(new Bar().valueOf(), "myValueOf");
  });
  
})(jQuery);