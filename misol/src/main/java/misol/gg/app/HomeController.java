package misol.gg.app;

import java.util.Locale;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Handles requests for the application home page.
 */
@Controller
public class HomeController {

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String home(Locale locale, Model model) {
        return "main:index";
    }

    @RequestMapping(value = "/noItem")
    public String noItem(Locale locale, Model model) {
        model.addAttribute("result", "{noItem:true}");
        return "ajax:index";
    }

}
